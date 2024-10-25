#!/usr/bin/env nix-shell
#!nix-shell -i "bash -x" -p bash jq git nodejs
npm i
npm run setup || exit 1

export OWD="$PWD"
export NWD="`mktemp -d`"
echo "Src dir: $OWD"
echo "Exec dir: $NWD"

#NODE_PATH="$OWD/dist"
node "$OWD/dist/api/start.js"