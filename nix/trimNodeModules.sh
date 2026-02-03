# shellcheck shell=bash

# We don't care about CLI scripts:
echo "Removing CLI scripts..."
for f in ./node_modules/.bin/*; do
  rm -f "$(realpath $f)" $f
done
find ./node_modules -type d -name '.bin' | while read -r dir; do
  echo "Removing CLI scripts from $dir..."
  for f in "$dir"/*; do
    rm -f "$(realpath $f)" $f
  done
done

# Unused stuff in specific packages
time (
  echo -n "Removing unused module features: "
  rm -rf ./node_modules/typeorm/browser && echo -n .
  rm -rf ./node_modules/typeorm/cli && echo -n .
  rm -rf ./node_modules/typeorm/driver/**/*.map && echo -n .
  rm -rf ./node_modules/ajv/lib && echo -n .
#  rm -rf ./node_modules/ajv/dist/refs && echo -n .
)

time (
  echo -en "\nRemoving specific known large unneeded packages: "
  rm -rf ./node_modules/typescript && echo -n .
  rm -rf ./node_modules/@typescript/native-preview && echo -n .
  rm -rf ./node_modules/@tsconfig && echo -n .
  rm -rf ./node_modules/ts-node && echo -n .
  rm -rf ./node_modules/node-gyp && echo -n .
  rm -rf ./node_modules/node-gyp-build-optional-packages && echo -n .
  rm -rf ./node_modules/discord-protos/{discord_protos,scripts} && echo -n .
  rm -f ./node_modules/.package-lock.json && echo -n .
  rm -rf ./node_modules/@jimp/plugin-print/fonts && echo -n . # duplicated in dist/fonts
  rm -rf ./node_modules/@toondepauw/node-zstd-linux-x64-musl && echo -n .
  for i in ./node_modules/@jimp/*; do
    if [ -d "$i/dist/commonjs" ]; then
      rm -rf "$i/dist/commonjs" && echo -n .
    fi
    if [ -d "$i/dist/browser" ]; then
      rm -rf "$i/dist/browser" && echo -n .
    fi
  done

  find ./node_modules -name '*.map' -type f -delete -printf .
)

# sources
time (
  echo -en "\nRemoving source files: "
  #  typescript
  echo -en "\n - Typescript: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(ts|mts|cts|d\.ts)$' -type f -delete -printf .
  #  C/C++
  echo -en "\n - C/C++: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(c|cc|cpp|h|hh|hpp)$' -type f -delete -printf .
  #  rust
  echo -en "\n - Rust: "
  find ./node_modules -name '*.rs' -type f -delete -printf .
  #  coffeescript
  echo -en "\n - Coffeescript: "
  find ./node_modules -name '*.coffee' -type f -delete -printf .
)

# standard C/C++ build artifacts
time (
  echo -en "\nRemoving build artifacts: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(o|a|d|obj)$' -type f -delete -printf .
)

# ???
time (
  echo -en "\nRemoving other random build artifacts: "
  # find ./node_modules -wholename '*build/Release/obj' -type d -exec rm -rfv {} +
  # find ./node_modules -wholename '*build/Release/obj.target' -type d -exec rm -rfv {} +
  find ./node_modules -iname 'obj' -type f -delete -printf .
  find ./node_modules -iname 'obj.target' -type f -delete -printf .
  find ./node_modules -iname '*.ar-file-list' -type f -delete -printf .
  find ./node_modules -iname '*.stamp' -type f -delete -printf .
  find ./node_modules -iname '*musl.node' -type f -delete -printf .

  # rm -rf ./node_modules/typescript-json-schema
  rm -rf ./node_modules/node-gyp && echo -n .
  find ./node_modules -iname '@types' -type d -exec rm -rf {} + -printf .
)

time (
  echo "Removing random common files..."
  echo -en "\n - other: "
  find ./node_modules -regextype posix-extended -iregex '.*(\.(github|idea|devcontainer)|tests?|docs?|examples?)$' -type d -exec rm -rf {} + -printf .
  find ./node_modules -regextype posix-extended -iregex '.*(__image_snapshots__|__snapshots__|__tests__|__fixtures__)$' -type d -exec rm -rf {} + -printf .
  find ./node_modules -name '.tshy' -type d -exec rm -rf {} + -printf .
  echo -en "\n - scripts: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(sh|cmd|bat|makefile|mk)$' -type f -delete -printf .
  find ./node_modules -iname 'makefile' -type f -delete -printf .
  find ./node_modules -regextype posix-extended -iregex '.*\.(in|py)$' -type f -delete -printf .
  echo -en "\n - package locks: "
  find ./node_modules -regextype posix-extended -iregex '.*(yarn\.lock|deno-lock\.json|deno\.lock|deno\.jsonc)$' -type f -delete -printf .
  echo -en "\n - ignore files: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(docker|git|npm|eslint|prettier)ignore$' -type f -delete -printf .
  echo -en "\n - git metadata: "
  find ./node_modules -regextype posix-extended -iregex '.*\.git(keep|attributes|modules)$' -type f -delete -printf .
  find ./node_modules -regextype posix-extended -iregex '.*(codeowners|changelog)$' -type f -delete -printf .
  echo -en "\n - README files: "
  find ./node_modules -regextype posix-extended -iregex '.*readme(\.md|\.txt)?$' -type f -delete -printf .
  find ./node_modules -iname 'readme' -type f -delete -printf .
  echo -en "\n - RC files: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(babel|eslint|prettier|npm|nvm|swc|stylelint|mocha|jshint|nyc|yarn|ncurc)rc(\.(yml|json|(m|c)?js))?$' -type f -delete -printf .
  echo -en "\n - image files: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(png|jpg|jpeg|gif|svg|ico|webp|bmp|tiff)$' -type f -delete -printf .
  echo -en "\n - text files: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(txt|rst|log|md|markdown|hbs|bnf)$' -type f -delete -printf .
  echo -en "\n - IDE/editor config/buffer files: "
  find ./node_modules -regextype posix-extended -iregex '.*(\.(swp|swo|eslintcache)|~)$' -type f -delete -printf .
  find ./node_modules -regextype posix-extended -iregex '.*\.(vscode|editorconfig|pre-commit-config\.yaml)$' -type f -delete -printf .
  find ./node_modules -regextype posix-extended -iregex '.*\.(vscode|idea)$' -type d -exec rm -rf {} + -printf .
  find ./node_modules -regextype posix-extended -iregex '.*\.jsdoc-conf\.json$' -type f -delete -printf .
  find ./node_modules -iname '*.iml' -type f -delete -printf .
  echo -en "\n - CI configuration files: "
  find ./node_modules -regextype posix-extended -iregex '.*(travis|circleci|github|gitlab|airtap|appveyor|wercker|codeship|drone|semaphoreci|buildkite).*\.(yml|yaml)$' -type f -delete -printf .
  find ./node_modules -regextype posix-extended -iregex '.*\.runkit_example\.js$' -type d -exec rm -rf {} + -printf .
  find ./node_modules -regextype posix-extended -iregex '.*dockerfile.*' -type f -delete -printf .
  echo -en "\n - TypeScript meta files: "
  find ./node_modules -iname '*.tsbuildinfo' -type f -delete -printf .
  find ./node_modules -iname 'tsconfig.json' -type f -delete -printf .
  echo -en "\n - YAML/TOML/HTML/CSS files: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(html|yml|yaml|toml|css)$' -type f -delete -printf .
  echo -en "\n - Non-normalised JS files (ie. umd/amd/...): "
  find ./node_modules -regextype posix-extended -iregex '.*\.(amd|umd|browser|web)\.(cjs|mjs|js)$' -type f -delete -printf .
  echo -en "\n - Test/spec JS files: "
  find ./node_modules -regextype posix-extended -iregex '.*\.(test|spec)\.(m|c)?js$' -type f -delete -printf .
  find ./node_modules -regextype posix-extended -iregex '.*\.(conf|config)\.(m|c)?js$' -type f -delete -printf .
)

if true; then
  # Probably dont do this, lol, only saves ~1M anyways
  # Purely for statistical purposes
  echo -en "\nRemoving license files: "
  find ./node_modules -iname 'LICENSE' -type f -delete -printf .
  find ./node_modules -iname 'license.terms' -type f -delete -printf .
  find ./node_modules -iname 'LICENSE.txt' -type f -delete -printf .
  find ./node_modules -iname 'LICENSE.BSD' -type f -delete -printf .
  find ./node_modules -iname 'LICENSE.MIT' -type f -delete -printf .
  find ./node_modules -iname 'LICENSE.APACHE2' -type f -delete -printf .
  find ./node_modules -iname 'LICENSE-MIT.txt' -type f -delete -printf .
  find ./node_modules -iname 'LICENSE-MIT' -type f -delete -printf .
  find ./node_modules -iname '*LICENSE*' -type f -delete -printf .
  find ./node_modules -iname '*LICENCE*' -type f -delete -printf .
fi

time (
  echo -en "\nReplacing all dotenv transitive dependencies with own version: "
  find ./node_modules -regextype posix-extended -iregex '\./node_modules/.*/node_modules/dotenv' -type d | while read -r dir; do
    echo -n .
    echo "Replacing $dir"
    rm -rf "$dir"
    relpath=$(realpath --relative-to="$(dirname "$dir")" ./node_modules/dotenv)
    ln -s "$relpath" "$dir"
  done
)

echo -en "\nRemoving empty directories: "
find ./node_modules -maxdepth 10 -type d -empty -delete -printf .
echo -e "\nTrimming complete. Stats:"
du -sh ./{,.}* . 2>/dev/null | sort -h
