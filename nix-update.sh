#!/usr/bin/env nix-shell
#!nix-shell -i "bash -x" -p bash prefetch-npm-deps jq git nix-output-monitor
nix flake update
DEPS_HASH=`prefetch-npm-deps package-lock.json`
TMPFILE=$(mktemp)
jq '.npmDepsHash = "'$DEPS_HASH'"' hashes.json > $TMPFILE
mv -- "$TMPFILE" hashes.json

nom build .# || exit $?
git add hashes.json flake.lock flake.nix