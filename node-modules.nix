{
  pkgs,
  lib,
  ...
}:

let
  filteredSrc = lib.fileset.toSource {
    root = ./.;
    fileset = (
      lib.fileset.intersection ./. (
        lib.fileset.unions [
          ./package.json
          ./package-lock.json
          ./patches
        ]
      )
    );
  };
in
pkgs.buildNpmPackage {
  pname = "spacebar-server-ts-node_modules";
  nodejs = pkgs.nodejs_24;
  version = builtins.hashFile "sha256" ./package.json;

  meta = with lib; {
    description = "Node modules for the spacebar-server-ts package.";
    homepage = "https://github.com/spacebarchat/server";
    license = licenses.agpl3Plus;
    platforms = platforms.all;
    maintainers = with maintainers; [ RorySys ];
  };

  src = filteredSrc;
  npmDeps = pkgs.importNpmLock { npmRoot = filteredSrc; };
  npmConfigHook = pkgs.importNpmLock.npmConfigHook;

  dontNpmBuild = true;
  makeCacheWritable = true;

  nativeBuildInputs = with pkgs; [
    (pkgs.python3.withPackages (ps: with ps; [ setuptools ]))
  ];

  installPhase = ''
    runHook preInstall

    # Copy outputs
    echo "Copying node_modules as $out"
    cp -r node_modules $out
    echo -n 'Disk usage: '
    du -sh node_modules/

    runHook postInstall
  '';
}
