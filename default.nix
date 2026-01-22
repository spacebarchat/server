{ self, rVersion }:
{
  pkgs,
  lib,
  nodejs,
  ...
}:

let
  filteredSrc = lib.fileset.toSource {
    root = ./.;
    fileset = (
      lib.fileset.intersection ./. (
        lib.fileset.unions [
          ./src
          ./package.json
          ./package-lock.json
          ./tsconfig.json
          ./assets
          ./patches
          ./scripts
        ]
      )
    );
  };
in
pkgs.buildNpmPackage {
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

  src = filteredSrc;
  npmDeps = pkgs.importNpmLock { npmRoot = filteredSrc; };
  npmConfigHook = pkgs.importNpmLock.npmConfigHook;

  npmBuildScript = "build:tsgo";
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
      rm -v dist/src.tsbuildinfo
      rm -rv scripts
      time ${./nix/trimNodeModules.sh}

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
      makeWrapper ${pkgs.nodejs_24}/bin/node $out/bin/apply-migrations --prefix NODE_PATH : $out/node_modules --add-flags --enable-source-maps --add-flags $out/dist/apply-migrations.js

      # set +x
      runHook postInstall
    '';

  passthru.tests = pkgs.testers.runNixOSTest (import ./nix/tests/test-bundle-starts.nix self);
}
