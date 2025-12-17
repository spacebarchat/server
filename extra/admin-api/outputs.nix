{
  self,
  nixpkgs,
  flake-utils,
}:
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
    makeNupkg =
      {
        name,
        nugetDeps ? null,
        projectReferences ? [ ],
        projectFile ? "${name}/${name}.csproj",
        runtimeId ? null,
        useAppHost ? null,
        packNupkg ? true,
      }@args:
      pkgs.buildDotnetModule rec {
        inherit
          projectReferences
          nugetDeps
          projectFile
          runtimeId
          useAppHost
          ;

        pname = "${name}";
        version = "1.0.0-" + rVersion;
        dotnetPackFlags = [
          "--include-symbols"
          "--include-source"
          "--version-suffix ${rVersion}"
        ];
        #          dotnetFlags = [ "-v:diag" ];
        dotnet-sdk = pkgs.dotnet-sdk_10;
        dotnet-runtime = pkgs.dotnet-aspnetcore_10;
        src = pkgs.lib.cleanSource ./.;
        packNupkg = true;
        meta = with pkgs.lib; {
          description = "Spacebar Server, Typescript Edition (C# extensions)";
          homepage = "https://github.com/spacebarchat/server";
          license = licenses.agpl3Plus;
          maintainers = with maintainers; [ RorySys ];
        };
      };
  in
  {
    packages =
      let
        proj = self.packages.${system};
      in
      {
        Spacebar-Db = makeNupkg {
          name = "Spacebar.Db";
          nugetDeps = Spacebar.Db/deps.json;
        };
        Spacebar-AdminApi-Models = makeNupkg {
          name = "Spacebar.AdminApi.Models";
        };
        Spacebar-ConfigModel = makeNupkg {
          name = "Spacebar.ConfigModel";
        };
        Spacebar-CleanSettingsRows = makeNupkg {
          name = "Spacebar.CleanSettingsRows";
          nugetDeps = Spacebar.CleanSettingsRows/deps.json;
          packNupkg = false;
          projectReferences = [ proj.Spacebar-Db ];
        };
        Spacebar-AdminApi = makeNupkg {
          name = "Spacebar.AdminApi";
          nugetDeps = Spacebar.AdminApi/deps.json;
          packNupkg = false;
          projectReferences = [
            proj.Spacebar-AdminApi-Models
            proj.Spacebar-Db
          ];

        };
        #            Spacebar-AdminApi-TestClient = makeNupkg {
        #              name = "Spacebar.AdminApi.TestClient";
        #              projectFile = "Utilities/Spacebar.AdminApi.TestClient/Spacebar.AdminApi.TestClient.csproj";
        #              nugetDeps = Utilities/Spacebar.AdminApi.TestClient/deps.json;
        #              projectReferences = [
        #                proj.Spacebar-AdminApi-Models
        #              ];
        ##              runtimeId = "browser-wasm";
        ##              useAppHost = false;
        #            };
      };

    containers.admin-api = pkgs.dockerTools.buildLayeredImage {
      name = "spacebar-server-ts-admin-api";
      tag = builtins.replaceStrings [ "+" ] [ "_" ] self.packages.${system}.Spacebar-AdminApi.version;
      contents = [ self.packages.${system}.Spacebar-AdminApi ];
      config = {
        Cmd = [ "${self.outputs.packages.${system}.Spacebar-AdminApi}/bin/Spacebar.AdminApi" ];
        Expose = [ "3001" ];
      };
    };
  }
)
// {
  #      nixosModules.default = import ./nix/modules/default self;
  checks =
    let
      pkgs = import nixpkgs { system = "x86_64-linux"; };
    in
    pkgs.lib.recursiveUpdate (pkgs.lib.attrsets.unionOfDisjoint { } self.packages) {
      x86_64-linux = {
        #            spacebar-server-tests = self.packages.x86_64-linux.default.passthru.tests;
        docker-image = self.containers.x86_64-linux.admin-api;
      };
    };
}
