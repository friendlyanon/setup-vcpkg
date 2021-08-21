export const enum Inputs {
  gitUrl = "git-url",
  committish = "committish",
  cache = "cache",
  cacheKey = "cache-key",
  cacheRestoreKeys = "cache-restore-keys",
  cacheVersion = "cache-version",
  path = "path",
  ignoreReserveCacheError = "ignore-reserve-cache-error",
}

export const enum States {
  cache = "CACHE",
  cacheKey = "CACHE_KEY",
  path = "PATH",
  ignoreReserveCacheError = "IGNORE_RESERVE_CACHE_ERROR",
}
