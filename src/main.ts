import { restoreCache } from "@actions/cache";
import * as core from "@actions/core";
import { Inputs, States } from "./constants";
import { paths } from "./paths";
import fs from "fs";
import { execSync } from "child_process";
import { URL } from "url";
import { join } from "path";
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

function useSubmodule(committish: string) {
  if (committish !== "") {
    return false;
  }

  core.info("No committish passed, using git submodule at path");
  return true;
}

const outputCacheHit = "cache-hit";

async function main() {
  try {
    const path = core.getInput(Inputs.path);
    core.saveState(States.path, path);
    if (core.getBooleanInput(Inputs.ignoreReserveCacheError)) {
      core.saveState(States.ignoreReserveCacheError, "1");
    }

    if (core.getBooleanInput(Inputs.saveAlways)) {
      core.exportVariable("SETUP_VCPKG_SAVE_ALWAYS", "true");
    }

    const isWindows = getOS() === "Windows";
    const execOptions = {
      cwd: join(process.env.GITHUB_WORKSPACE!, path),
      stdio: "inherit",
    } as const;
    core.info(`Path: ${execOptions.cwd}`);

    const committish = core.getInput(Inputs.committish);
    const submodule = useSubmodule(committish);

    // Use forward slashes even on Windows
    const unixPath = isWindows
      ? execOptions.cwd.replace(/\\/ug, "/")
      : execOptions.cwd;
    core.info("Setting env variables:");
    const entries = [
      ["VCPKG_ROOT", unixPath],
      ["VCPKG_DEFAULT_BINARY_CACHE", `${unixPath}/.cache`],
    ] as const;
    for (const [key, value] of entries) {
      core.info(`    ${key}=${value}`);
      core.exportVariable(key, value);
    }

    const cachePath = join(execOptions.cwd, ".cache");
    await mkdir(execOptions.cwd);

    if (!submodule) {
      const gitUrl = new URL(core.getInput(Inputs.gitUrl));
      execSync(`git clone ${gitUrl} -n .`, execOptions);
      execSync(`git checkout -q -f ${committish}`, execOptions);
    }
    await mkdir(cachePath);

    let cacheHit = false;
    if (core.getBooleanInput(Inputs.cache)) {
      if (!core.getBooleanInput(Inputs.skipSave)) {
        core.saveState(States.cache, "1");
      }

      const cacheVersionInput = core.getInput(Inputs.cacheVersion);
      const cacheVersion = cacheVersionInput ? `-${cacheVersionInput}` : "";
      const cacheKey = core.getInput(Inputs.cacheKey)
        || `vcpkg-${getOS()}${cacheVersion}-${calculateHash(committish)}`;
      core.saveState(States.cacheKey, cacheKey);

      const cacheRestoreKeys = core.getInput(Inputs.cacheRestoreKeys)
        || `vcpkg-${getOS()}${cacheVersion}-`;
      const restoreKeys = cacheRestoreKeys.split("\n");

      const result = await restoreCache(paths(path), cacheKey, restoreKeys);
      if (result != null) {
        if (!isWindows) {
          execSync("chmod +x vcpkg", execOptions);
        }

        cacheHit = true;
        core.info(`\x1B[32mCache hit ${result}\x1B[0m`);
        core.setOutput(outputCacheHit, "true");

        if (isWindows) {
          return;
        }
      } else {
        core.info(`\x1B[36mCache miss ${
          cacheKey
        } [${restoreKeys.join(", ")}]\x1B[0m`);
        core.setOutput(outputCacheHit, "false");
      }
    } else {
      core.setOutput(outputCacheHit, "");
    }

    if (!cacheHit) {
      if (isWindows) {
        execSync("bootstrap-vcpkg.bat", execOptions);
      } else {
        execSync("chmod +x bootstrap-vcpkg.sh", execOptions);
        execSync("sh -e bootstrap-vcpkg.sh", execOptions);
      }
    }
  } catch (e) {
    const error = e as Error;
    core.info(String(error.stack));
    core.setFailed(String(error));
    process.exitCode = 1;
  }
}

void main();
