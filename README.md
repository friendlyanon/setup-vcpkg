# Setup vcpkg [![CI build][1]][2]

This is a GitHub action that sets vcpkg up in GitHub Actions and caches it.

See the [action.yaml](action.yaml) file for inputs and outputs.

## Example usage

    - uses: friendlyanon/setup-vcpkg@v1
      with: { committish: 63aa65e65b9d2c08772ea15d25fb8fdb0d32e557 }
    
    - name: Run CMake with manifest mode vcpkg
      shell: bash
      run: cmake -B build
        -D "CMAKE_TOOLCHAIN_FILE=$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake"

# What does it do?

Values in angle brackets (`<>`) are inputs.

* Sets the `VCPKG_ROOT` and `VCPKG_DEFAULT_BINARY_CACHE` env variables to
  `<path>` and `<path>/.cache` respectively.
* Attempts to restore vcpkg from the cache using `<path>`, `<cache-key>` and
  `<cache-restore-keys>`.
  * If successful, then stop.
* If `<committish>` was provided, clones `<git-url>` into `<path>` and checks
  `<committish>` out. Otherwise, a git submodule must exist at `<path>`.
* Runs `bootstrap-vcpkg.bat` on Windows or `bootstrap-vcpkg.sh` on *nix
  systems.

If `<cache>` is set to `false`, then the cache related steps are skipped. Only
the executable and binary cache are stored in the GitHub Actions cache.

# License
[MIT License](LICENSE)

[1]: https://github.com/friendlyanon/setup-vcpkg/workflows/CI/badge.svg
[2]: https://github.com/friendlyanon/setup-vcpkg/actions?query=workflow%3ACI+branch%3Amaster
