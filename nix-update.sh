#!/usr/bin/env nix-shell
#!nix-shell -i "bash -x" -p bash prefetch-npm-deps jq
DEPS_HASH=`prefetch-npm-deps package-lock.json`
TMPFILE=$(mktemp)
jq '.npm_deps_hash = "'$DEPS_HASH'"' hashes.json > $TMPFILE
mv -- "$TMPFILE" hashes.json