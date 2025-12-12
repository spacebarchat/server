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
    let
      hashesFile = builtins.fromJSON (builtins.readFile ./hashes.json);
      rVersion =
        let
          rev = self.sourceInfo.shortRev or self.sourceInfo.dirtyShortRev;
          date = builtins.substring 0 8 self.sourceInfo.lastModifiedDate;
          time = builtins.substring 8 6 self.sourceInfo.lastModifiedDate;
        in
        "preview.${date}-${time}+${rev}";
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
            npmDepsHash = hashesFile.npmDepsHash;
            npmBuildScript = "build:src";
            makeCacheWritable = true;
            nativeBuildInputs = with pkgs; [
              python3
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

          update-nix-hashes = pkgs.writeShellApplication {
            name = "update-nix";
            runtimeInputs = with pkgs; [
              prefetch-npm-deps
              nix
              jq
            ];
            text = ''
              rm -rf node_modules
              ${pkgs.nodejs_24}/bin/npm install --save --no-audit --no-fund --prefer-offline
              DEPS_HASH=$(prefetch-npm-deps package-lock.json)
              TMPFILE=$(mktemp)
              jq '.npmDepsHash = "'"$DEPS_HASH"'"' hashes.json > "$TMPFILE"
              mv -- "$TMPFILE" hashes.json
            '';
          };

          update-nix-flake = pkgs.writeShellApplication {
            name = "update-nix";
            runtimeInputs = with pkgs; [
              prefetch-npm-deps
              nix
              jq
            ];
            text = ''
              nix flake update --extra-experimental-features 'nix-command flakes'
            '';
          };
        };

        containers.docker = pkgs.dockerTools.buildLayeredImage {
          name = "spacebar-server-ts";
          tag = builtins.replaceStrings [ "+" ] [ "_" ] self.packages.${system}.default.version;
          contents = [ self.packages.${system}.default ];
          config = {
            Cmd = [ "${self.outputs.packages.${system}.default}/bin/start-bundle" ];
            Expose = [ "3001" ];
          };
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
        in
        pkgs.lib.recursiveUpdate (pkgs.lib.attrsets.unionOfDisjoint { } self.packages) {
          x86_64-linux = {
            spacebar-server-tests = self.packages.x86_64-linux.default.passthru.tests;
            docker-image = self.containers.x86_64-linux.docker;
          };
        };
    };
}
