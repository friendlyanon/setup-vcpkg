# Setup vcpkg [![CI build][1]][2]

This is a GitHub action that sets vcpkg up in GitHub Actions and caches it.

See the [actions.yaml](actions.yaml) file for inputs and outputs.

## Example usage

    - uses: friendlyanon/setup-vcpkg@v1
    
    - name: Run CMake with manifest mode vcpkg
      shell: bash
      run: cmake -B build
        -D "CMAKE_TOOLCHAIN_FILE=$VCPKG_ROOT/scripts/buildsystems/vcpkg.cmake"

# License
[MIT License](LICENSE)

[1]: https://github.com/friendlyanon/setup-vcpkg/workflows/CI/badge.svg
[2]: https://github.com/friendlyanon/setup-vcpkg/actions?query=workflow%3ACI+branch%3Amaster
