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
        srcRoot ? ./.,
      }@args:
      pkgs.buildDotnetModule rec {
        inherit
          projectReferences
          nugetDeps
          projectFile
          runtimeId
          useAppHost
          srcRoot
          ;

        pname = "${name}";
        version = "1.0.0-" + rVersion;
        dotnetPackFlags = [
          "--include-symbols"
          "--include-source"
          "--version-suffix ${rVersion}"
        ];
        dotnetFlags = [ "-v:n" ]; # diag
        dotnet-sdk = pkgs.dotnet-sdk_10;
        dotnet-runtime = pkgs.dotnet-aspnetcore_10;
        src = pkgs.lib.cleanSource srcRoot;
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
        # Interop
        Spacebar-Interop-Authentication = makeNupkg {
          name = "Spacebar.Interop.Authentication";
          projectFile = "Spacebar.Interop.Authentication.csproj";
          nugetDeps = Interop/Spacebar.Interop.Authentication/deps.json;
          srcRoot = Interop/Spacebar.Interop.Authentication;
          projectReferences = [ proj.Spacebar-Models-Db ];
        };
        Spacebar-Interop-Authentication-AspNetCore = makeNupkg {
          name = "Spacebar.Interop.Authentication.AspNetCore";
          projectFile = "Spacebar.Interop.Authentication.AspNetCore.csproj";
          nugetDeps = Interop/Spacebar.Interop.Authentication.AspNetCore/deps.json;
          srcRoot = Interop/Spacebar.Interop.Authentication.AspNetCore;
          projectReferences = [
            proj.Spacebar-Models-Db
            proj.Spacebar-Interop-Authentication
          ];
        };
        Spacebar-Interop-Cdn-Abstractions = makeNupkg {
          name = "Spacebar.Interop.Cdn.Abstractions";
          projectFile = "Spacebar.Interop.Cdn.Abstractions.csproj";
          nugetDeps = Interop/Spacebar.Interop.Cdn.Abstractions/deps.json;
          srcRoot = Interop/Spacebar.Interop.Cdn.Abstractions;
        };
        Spacebar-Interop-Replication-Abstractions = makeNupkg {
          name = "Spacebar.Interop.Replication.Abstractions";
          projectFile = "Spacebar.Interop.Replication.Abstractions.csproj";
          srcRoot = Interop/Spacebar.Interop.Replication.Abstractions;
        };
        Spacebar-Interop-Replication-RabbitMq = makeNupkg {
          name = "Spacebar.Interop.Replication.RabbitMq";
          projectFile = "Spacebar.Interop.Replication.RabbitMq.csproj";
          nugetDeps = Interop/Spacebar.Interop.Replication.RabbitMq/deps.json;
          srcRoot = Interop/Spacebar.Interop.Replication.RabbitMq;
          projectReferences = [ proj.Spacebar-Interop-Replication-Abstractions ];
        };
        Spacebar-Interop-Replication-UnixSocket = makeNupkg {
          name = "Spacebar.Interop.Replication.UnixSocket";
          projectFile = "Spacebar.Interop.Replication.UnixSocket.csproj";
          nugetDeps = Interop/Spacebar.Interop.Replication.UnixSocket/deps.json;
          srcRoot = Interop/Spacebar.Interop.Replication.UnixSocket;
          projectReferences = [ proj.Spacebar-Interop-Replication-Abstractions ];
        };

        # Models
        Spacebar-Models-AdminApi = makeNupkg {
          name = "Spacebar.Models.AdminApi";
          projectFile = "Spacebar.Models.AdminApi.csproj";
          srcRoot = Models/Spacebar.Models.AdminApi;
        };
        Spacebar-Models-Config = makeNupkg {
          name = "Spacebar.Models.Config";
          projectFile = "Spacebar.Models.Config.csproj";
          srcRoot = Models/Spacebar.Models.Config;
        };
        Spacebar-Models-Db = makeNupkg {
          name = "Spacebar.Models.Db";
          projectFile = "Spacebar.Models.Db.csproj";
          nugetDeps = Models/Spacebar.Models.Db/deps.json;
          srcRoot = Models/Spacebar.Models.Db;
        };
        Spacebar-Models-Gateway = makeNupkg {
          name = "Spacebar.Models.Gateway";
          projectFile = "Spacebar.Models.Gateway.csproj";
          # nugetDeps = Models/Spacebar.Models.Gateway/deps.json;
          srcRoot = Models/Spacebar.Models.Gateway;
          projectReferences = [ proj.Spacebar-Models-Generic ];
        };
        Spacebar-Models-Generic = makeNupkg {
          name = "Spacebar.Models.Generic";
          projectFile = "Spacebar.Models.Generic.csproj";
          # nugetDeps = Models/Spacebar.Models.Generic/deps.json;
          srcRoot = Models/Spacebar.Models.Generic;
        };

        # Utilities
        Spacebar-CleanSettingsRows = makeNupkg {
          name = "Spacebar.CleanSettingsRows";
          srcRoot = Utilities/Spacebar.CleanSettingsRows;
          projectFile = "Spacebar.CleanSettingsRows.csproj";
          nugetDeps = Utilities/Spacebar.CleanSettingsRows/deps.json;
          packNupkg = false;
          projectReferences = [ proj.Spacebar-Models-Db ];
        };
        Spacebar-Cdn-Fsck = makeNupkg {
          name = "Spacebar.Cdn.Fsck";
          projectFile = "Spacebar.Cdn.Fsck.csproj";
          srcRoot = Utilities/Spacebar.Cdn.Fsck;
          nugetDeps = Utilities/Spacebar.Cdn.Fsck/deps.json;
          packNupkg = false;
          projectReferences = [
            proj.Spacebar-Models-Db
            proj.Spacebar-Interop-Cdn-Abstractions
          ];
        };

        # Main projects
        Spacebar-AdminApi = makeNupkg {
          name = "Spacebar.AdminApi";
          nugetDeps = Spacebar.AdminApi/deps.json;
          projectFile = "Spacebar.AdminApi.csproj";
          srcRoot = ./Spacebar.AdminApi;
          packNupkg = false;
          projectReferences = [
            proj.Spacebar-Interop-Authentication
            proj.Spacebar-Interop-Authentication-AspNetCore
            proj.Spacebar-Interop-Replication-Abstractions
            proj.Spacebar-Interop-Replication-UnixSocket
            proj.Spacebar-Models-AdminApi
            proj.Spacebar-Models-Config
            proj.Spacebar-Models-Db
          ];
        };
        Spacebar-Cdn = makeNupkg {
          name = "Spacebar.Cdn";
          nugetDeps = Spacebar.Cdn/deps.json;
          projectFile = "Spacebar.Cdn.csproj";
          srcRoot = ./Spacebar.Cdn;
          packNupkg = false;
          projectReferences = [
            proj.Spacebar-Models-Db
            proj.Spacebar-Interop-Cdn-Abstractions
          ];
        };
        Spacebar-GatewayOffload = makeNupkg {
          name = "Spacebar.GatewayOffload";
          nugetDeps = Spacebar.GatewayOffload/deps.json;
          projectFile = "Spacebar.GatewayOffload.csproj";
          srcRoot = ./Spacebar.GatewayOffload;
          packNupkg = false;
          projectReferences = [
            proj.Spacebar-Interop-Authentication
            proj.Spacebar-Interop-Authentication-AspNetCore
            proj.Spacebar-Interop-Replication-Abstractions
            proj.Spacebar-Models-Db
            proj.Spacebar-Models-Gateway
            proj.Spacebar-Models-Generic
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

    containers.docker.admin-api = pkgs.dockerTools.buildLayeredImage {
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
        docker-admin-api = self.containers.x86_64-linux.docker.admin-api;
      };
    };
}
