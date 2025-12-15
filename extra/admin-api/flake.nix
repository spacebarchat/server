{
  description = "Spacebar server, written in Typescript.";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    import ./outputs.nix {
      inherit self nixpkgs flake-utils;
    };
}
