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
              default = pkgs.buildNpmPackage {
                pname = "spacebar-server-ts";
                nodejs = pkgs.nodejs_24;
                version = "1.0.0-" + rVersion;

                meta = with lib; {
                  description = "Spacebar server, a FOSS reimplementation of the Discord backend.";
                  homepage = "https://github.com/spacebarchat/server";
                  license = licenses.agpl3Plus;
                  platforms = platforms.all;
                  mainProgram = "start-bundle";
                  maintainers = with maintainers; [ RorySys ]; # lol.
                };

                src = ./.;
                npmDeps = pkgs.importNpmLock { npmRoot = ./.; };
                npmConfigHook = pkgs.importNpmLock.npmConfigHook;

                npmBuildScript = "build:src";
                makeCacheWritable = true;
                nativeBuildInputs = with pkgs; [
                  (pkgs.python3.withPackages (ps: with ps; [ setuptools ]))
                ];

                installPhase =
                  let
                    revsFile = pkgs.writeText "spacebar-server-rev.json" (
                      builtins.toJSON {
                        rev = self.sourceInfo.rev or self.sourceInfo.dirtyRev;
                        shortRev = self.sourceInfo.shortRev or self.sourceInfo.dirtyShortRev;
                        lastModified = self.sourceInfo.lastModified;
                      }
                    );
                  in
                  ''
                    runHook preInstall
                    # set -x

                    # remove packages not needed for production, or at least try to...
                    npm prune --omit dev --no-save $npmInstallFlags "''${npmInstallFlagsArray[@]}" $npmFlags "''${npmFlagsArray[@]}"
                    ${./nix/trimNodeModules.sh}

                    # Copy outputs
                    echo "Installing package into $out"
                    mkdir -p $out
                    cp -r assets dist node_modules package.json $out/
                    cp ${revsFile} $out/.rev

                    # Create wrappers for start scripts
                    echo "Creating wrappers for start scripts"
                    for i in dist/**/start.js
                    do
                      makeWrapper ${pkgs.nodejs_24}/bin/node $out/bin/start-`dirname ''${i/dist\//}` --prefix NODE_PATH : $out/node_modules --add-flags --enable-source-maps --add-flags $out/$i
                    done

                    # set +x
                    runHook postInstall
                  '';

                passthru.tests = pkgs.testers.runNixOSTest (import ./nix/tests/test-bundle-starts.nix self);
              };
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
