# shellcheck shell=bash

# We don't care about CLI scripts:
for f in ./node_modules/.bin/*; do
  rm -f "$(realpath $f)" $f
done
# sources
echo "Removing source files..."
find ./node_modules -name '*.ts' -type f -delete
find ./node_modules -name '*.mts' -type f -delete
find ./node_modules -name '*.cts' -type f -delete
find ./node_modules -name '*.coffee' -type f -delete
find ./node_modules -name '*.rs' -type f -delete
find ./node_modules -name '*.c' -type f -delete
find ./node_modules -name '*.cc' -type f -delete
find ./node_modules -name '*.cpp' -type f -delete
find ./node_modules -name '*.h' -type f -delete
find ./node_modules -name '*.hh' -type f -delete
find ./node_modules -name '*.hpp' -type f -delete

# standard C/C++ build artifacts
echo "Removing build artifacts..."
find ./node_modules -name '*.o' -type f -delete
find ./node_modules -name '*.a' -type f -delete
find ./node_modules -name '*.d' -type f -delete

# ???
echo "Removing other random build artifacts..."
# find ./node_modules -wholename '*build/Release/obj' -type d -exec rm -rfv {} +
# find ./node_modules -wholename '*build/Release/obj.target' -type d -exec rm -rfv {} +
find ./node_modules -name 'obj' -type f -delete
find ./node_modules -name 'obj.target' -type f -delete
find ./node_modules -name '*.ar-file-list' -type f -delete
find ./node_modules -name '*.stamp' -type f -delete
find ./node_modules -name '*musl.node' -type f -delete
rm -rf ./node_modules/typescript
rm -rf ./node_modules/@typescript/native-preview
rm -rf ./node_modules/ts-node
rm -rf ./node_modules/node-gyp
rm -rf ./node_modules/node-gyp-build-optional-packages
rm -rf ./node_modules/discord-protos/{discord_protos,scripts}

# rm -rf ./node_modules/typescript-json-schema
rm -rf ./node_modules/node-gyp
find ./node_modules -name '@types' -type d -exec rm -rf {} +

echo "Removing random common files..."
find ./node_modules -name 'test' -type d -exec rm -rf {} +
find ./node_modules -name 'tests' -type d -exec rm -rf {} +
find ./node_modules -name 'examples' -type d -exec rm -rf {} +
find ./node_modules -name 'coverage' -type d -exec rm -rf {} + # Why would you ship coverage reports in artifacts??
find ./node_modules -name '.nyc_output' -type d -exec rm -rf {} +
find ./node_modules -name 'doc' -type d -exec rm -rf {} +
find ./node_modules -name 'docs' -type d -exec rm -rf {} +
find ./node_modules -name '.idea' -type d -exec rm -rf {} +
find ./node_modules -name '.github' -type d -exec rm -rf {} +
find ./node_modules -name '__snapshots__' -type d -exec rm -rf {} +
find ./node_modules -name '.turbo' -type d -exec rm -rf {} +
find ./node_modules -name '.tshy' -type d -exec rm -rf {} +
find ./node_modules -name '__image_snapshots__' -type d -exec rm -rf {} +
find ./node_modules -name '*.md' -type f -delete
find ./node_modules -name '*.markdown' -type f -delete
find ./node_modules -name '*~' -type f -delete # Someone forgot some editor buffers, lol
find ./node_modules -name 'requirements.txt' -type f -delete
find ./node_modules -name 'pyproject.toml' -type f -delete
find ./node_modules -name '*.py' -type f -delete
find ./node_modules -name '*.sh' -type f -delete
find ./node_modules -name '*.bat' -type f -delete
find ./node_modules -name '*.cmd' -type f -delete
find ./node_modules -name '*.in' -type f -delete
find ./node_modules -name '*.mk' -type f -delete
find ./node_modules -name '*.txt' -type f -delete
find ./node_modules -name '*.Makefile' -type f -delete
find ./node_modules -name '*.d.ts' -type f -delete
find ./node_modules -name '*.log' -type f -delete
find ./node_modules -name '*.tar.gz' -type f -delete
find ./node_modules -name '*.cs' -type f -delete
find ./node_modules -name '*.rc' -type f -delete
find ./node_modules -name '*.am' -type f -delete
find ./node_modules -name '*.fallback' -type f -delete
find ./node_modules -name '*.msc' -type f -delete
find ./node_modules -name '*.1' -type f -delete
find ./node_modules -name '*.m4' -type f -delete
find ./node_modules -name '*.vc' -type f -delete
find ./node_modules -name 'Makefile' -type f -delete
find ./node_modules -name 'Dockerfile*' -type f -delete
find ./node_modules -name 'tsconfig.*' -type f -delete
find ./node_modules -name '.travis.yml' -type f -delete
find ./node_modules -name '.prettier*' -type f -delete
find ./node_modules -name '.airtap.yml' -type f -delete
find ./node_modules -name '.eslintrc' -type f -delete
find ./node_modules -name '.eslintrc.yml' -type f -delete
find ./node_modules -name '.gitattributes' -type f -delete
find ./node_modules -name '.npmignore' -type f -delete
find ./node_modules -name '.nycrc' -type f -delete
find ./node_modules -name '.editorconfig' -type f -delete
find ./node_modules -name '.eslintignore' -type f -delete
find ./node_modules -name 'yarn.lock' -type f -delete
find ./node_modules -name 'CODEOWNERS' -type f -delete
find ./node_modules -name 'README' -type f -delete
find ./node_modules -name 'changelog' -type f -delete
find ./node_modules -name '*.stflow' -type f -delete
find ./node_modules -name '.docker*' -type f -delete
find ./node_modules -name 'deno.lock' -type f -delete
find ./node_modules -name 'configure' -type f -delete

if false; then
  # Probably dont do this, lol, only saves ~1M anyways
  # Purely for statistical purposes
  find ./node_modules -name 'LICENSE' -type f -delete
  find ./node_modules -name 'License' -type f -delete
  find ./node_modules -name 'license' -type f -delete
  find ./node_modules -name 'license.terms' -type f -delete
  find ./node_modules -name 'LICENSE.txt' -type f -delete
  find ./node_modules -name 'LICENSE.BSD' -type f -delete
  find ./node_modules -name 'LICENSE.MIT' -type f -delete
  find ./node_modules -name 'LICENSE.APACHE2' -type f -delete
  find ./node_modules -name 'LICENSE-MIT.txt' -type f -delete
fi

echo "Removing empty directories..."
find node_modules -maxdepth 1 -type d -empty -delete
echo "Trimming complete."