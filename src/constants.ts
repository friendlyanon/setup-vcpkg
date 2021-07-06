export const enum Inputs {
  gitUrl = "git-url",
  committish = "committish",
  cache = "cache",
  cacheKey = "cache-key",
  cacheRestoreKeys = "cache-restore-keys",
  path = "path",
}

export const enum States {
  cache = "CACHE",
  cacheKey = "CACHE_KEY",
  cacheHit = "CACHE_HIT",
  path = "PATH",
}
