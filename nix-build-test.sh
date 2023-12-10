#!/usr/bin/env sh
#nix build --update-input pnpm2nix --debugger --ignore-try
nix build --debugger --ignore-try --print-out-paths --print-build-logs --http2 "$@"
