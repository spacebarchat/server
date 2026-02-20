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
          ./tsconfig.json
          ./assets
          ./patches
          ./scripts
        ]
      )
    );
  };
in
pkgs.stdenv.mkDerivation {
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
  dontStrip = true;

  npmBuildScript = "build:tsgo";
  nativeBuildInputs = with pkgs; [
    nodejs
    makeWrapper
    (pkgs.python3.withPackages (ps: with ps; [ setuptools ]))
  ];

  configurePhase = ''
    cp -r --no-preserve=ownership,timestamps ${pkgs.callPackage ./node-modules.nix { }} node_modules
    chown $USER:$GROUP node_modules -Rc
    chmod +w node_modules -Rc
  '';

  buildPhase = ''
    npm run --loglevel silly build:tsgo
  '';

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

      echo installPhase
      # remove packages not needed for production, or at least try to...
      npm prune --omit dev --no-save  --offline #--loglevel silly
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
