#!/usr/bin/env nix-shell
#!nix-shell -i "bash -x" -p bash
DEPS_HASH=`nix run nixpkgs#prefetch-npm-deps -- package-lock.json`
sed 's/$NPM_HASH/'${DEPS_HASH/\//\\\/}'/g' flake.template.nix > flake.nix
