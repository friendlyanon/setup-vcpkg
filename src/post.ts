import { saveCache } from "@actions/cache";
import * as core from "@actions/core";
import { States } from "./constants";
import { paths } from "./paths";

async function main() {
  try {
    if (core.getState(States.cacheHit) === "1") {
      core.info("Cache hit");
      return;
    }

    if (core.getState(States.cache) === "") {
      core.info("Cache is disabled");
      return;
    }

    const cacheKey = core.getState(States.cacheKey);
    const cachePaths = paths(core.getState(States.path));
    await saveCache(cachePaths, cacheKey);
  } catch (error) {
    if (error.name === "ReserveCacheError") {
      core.warning(error);
      return;
    }

    core.info(error.stack);
    core.setFailed(String(error));
    process.exitCode = 1;
  }
}

void main();
