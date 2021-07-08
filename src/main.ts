import { restoreCache } from "@actions/cache";
import * as core from "@actions/core";
import { Inputs, States } from "./constants";
import { paths } from "./paths";
import fs from "fs";
import { execSync } from "child_process";
import { URL } from "url";
import { join } from "path";
import del from "del";
import { createHash } from "crypto";

/**
 * @return {"Windows" | "Linux" | "macOS"} String corresponding to the
 * runner.os context value
 */
const getOS = () => process.env.RUNNER_OS!;

const mkdir = (path: string) => fs.promises.mkdir(path, { recursive: true });

function calculateHash(committish: string) {
  const sha = process.env.GITHUB_SHA!;
  const hash = createHash("sha1");
  hash.update(sha);
  hash.update(committish);
  return hash.digest("hex");
}

const outputCacheHit = "cache-hit";

async function main() {
  try {
    const path = core.getInput(Inputs.path);
    core.saveState(States.path, path);

    const execOptions = {
      cwd: join(process.env.GITHUB_WORKSPACE!, path),
      stdio: "inherit",
    } as const;
    core.info(`Path: ${execOptions.cwd}`);

    // Use forward slashes even on Windows
    const unixPath = getOS() === "Windows"
      ? execOptions.cwd.replace(/\\/ug, "/")
      : execOptions.cwd;
    core.exportVariable("VCPKG_ROOT", unixPath);
    core.exportVariable("VCPKG_DEFAULT_BINARY_CACHE", `${unixPath}/.cache`);

    const cachePath = join(execOptions.cwd, ".cache");
    await mkdir(execOptions.cwd);

    const committish = core.getInput(Inputs.committish);
    if (core.getBooleanInput(Inputs.cache)) {
      core.saveState(States.cache, "1");

      const cacheKey = core.getInput(Inputs.cacheKey)
        || `vcpkg-${getOS()}-${calculateHash(committish)}`;
      core.saveState(States.cacheKey, cacheKey);

      const cacheRestoreKeys = core.getInput(Inputs.cacheRestoreKeys)
        || `vcpkg-${getOS()}-`;
      const restoreKeys = cacheRestoreKeys.split("\n");

      const result = await restoreCache(paths(path), cacheKey, restoreKeys);
      if (result != null) {
        if (getOS() !== "Windows") {
          execSync("chmod +x vcpkg", execOptions);
        }
        core.info(`Cache hit ${result}`);
        core.setOutput(outputCacheHit, "true");
        core.saveState(States.cacheHit, "1");
        await mkdir(cachePath);
        return;
      }

      core.info(`Cache miss ${cacheKey} [${restoreKeys.join(", ")}]`);
      core.setOutput(outputCacheHit, "false");
    } else {
      core.setOutput(outputCacheHit, "");
    }

    const gitUrl = new URL(core.getInput(Inputs.gitUrl));
    execSync(`git clone ${gitUrl} -n .`, execOptions);
    execSync(`git checkout -f ${committish}`, execOptions);

    if (getOS() === "Windows") {
      execSync("bootstrap-vcpkg.bat", execOptions);
    } else {
      execSync("chmod +x bootstrap-vcpkg.sh", execOptions);
      execSync("sh -e bootstrap-vcpkg.sh", execOptions);
    }

    await del(join(execOptions.cwd, ".git"), { force: true });
    await mkdir(cachePath);
  } catch (error) {
    core.info(error.stack);
    core.setFailed(String(error));
    process.exitCode = 1;
  }
}

void main();
