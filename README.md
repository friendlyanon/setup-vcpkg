# Setup vcpkg [![CI build][1]][2]

This is a GitHub action that sets vcpkg up in GitHub Actions and caches it.

See the [action.yaml](action.yaml) file for inputs and outputs.

## Example usage

    - uses: friendlyanon/setup-vcpkg@v1
    
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
* Clones the `<git-url>` into `<path>` and checks `<committish>` out.
* Runs `bootstrap-vcpkg.bat` on Windows or `bootstrap-vcpkg.sh` on *nix
  systems.
* Deletes the `<path>/.git` directory.
* Caches `<path>` with the subdirectories `buildtrees`, `downloads`,
  `installed` and `packages` ignored.

If `<cache>` is set to `false`, then the cache related steps are skipped.

# License
[MIT License](LICENSE)

[1]: https://github.com/friendlyanon/setup-vcpkg/workflows/CI/badge.svg
[2]: https://github.com/friendlyanon/setup-vcpkg/actions?query=workflow%3ACI+branch%3Amaster
