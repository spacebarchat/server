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
    nixpkgs.lib.recursiveUpdate
      (
        let
          rVersion =
            let
              rev = self.sourceInfo.shortRev or self.sourceInfo.dirtyShortRev;
              date = builtins.substring 0 8 self.sourceInfo.lastModifiedDate;
              time = builtins.substring 8 6 self.sourceInfo.lastModifiedDate;
            in
            "preview.${date}-${time}"; # +${rev}";
        in
        flake-utils.lib.eachSystem flake-utils.lib.allSystems (
          system:
          let
            pkgs = import nixpkgs {
              inherit system;
            };
            lib = pkgs.lib;
          in
          {
            packages = {
              default = (pkgs.callPackage (import ./default.nix { inherit self rVersion; })) { };
            };

            containers = {
              docker = {
                default = pkgs.dockerTools.buildLayeredImage {
                  name = "spacebar-server-ts";
                  tag = builtins.replaceStrings [ "+" ] [ "_" ] self.packages.${system}.default.version;
                  contents = [ self.packages.${system}.default ];
                  config = {
                    Cmd = [ "${self.outputs.packages.${system}.default}/bin/start-bundle" ];
                    Expose = [ "3001" ];
                  };
                };
              }
              // lib.genAttrs [ "api" "cdn" "gateway" ] (
                mod:
                pkgs.dockerTools.buildLayeredImage {
                  name = "spacebar-server-ts-${mod}";
                  tag = builtins.replaceStrings [ "+" ] [ "_" ] self.packages.${system}.default.version;
                  contents = [
                    self.packages.${system}.default
                  ];
                  config = {
                    Cmd = [ "${self.outputs.packages.${system}.default}/bin/start-${mod}" ];
                    Expose = [ "3001" ];
                  };

                }
              );
            };

            devShells.default = pkgs.mkShell {
              buildInputs = with pkgs; [
                nodejs_24
                nodePackages.typescript
                nodePackages.patch-package
                nodePackages.prettier
              ];
            };
          }
        )
        // {
          nixosModules.default = import ./nix/modules/default self;
          checks =
            let
              pkgs = import nixpkgs { system = "x86_64-linux"; };
              lib = pkgs.lib;
            in
            lib.recursiveUpdate (lib.attrsets.unionOfDisjoint { } self.packages) {
              x86_64-linux = {
                spacebar-server-tests = self.packages.x86_64-linux.default.passthru.tests;
              }
              // (lib.listToAttrs (
                lib.mapAttrsToList (name: container: {
                  name = "docker-${name}";
                  value = container;
                }) self.containers.x86_64-linux.docker
              ));
            };
        }
      )
      (
        import ./extra/admin-api/outputs.nix {
          inherit self nixpkgs flake-utils;
        }
      );
}
