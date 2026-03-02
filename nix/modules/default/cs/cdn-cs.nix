self:
{
  config,
  lib,
  pkgs,
  spacebar,
  ...
}:

let
  secrets = import ../secrets.nix { inherit lib config; };
  cfg = config.services.spacebarchat-server;
  jsonFormat = pkgs.formats.json { };
in
{
  imports = [ ];
  options.services.spacebarchat-server.cdnCs = lib.mkOption {
    default = { };
    description = "Configuration for C# cdn.";
    type = lib.types.submodule {
      options = {
        enable = lib.mkEnableOption "Enable experimental C# CDN.";
        extraConfiguration = lib.mkOption {
          type = jsonFormat.type;
          default = import ./default-appsettings-json.nix;
          description = "Extra appsettings.json configuration for the gateway offload daemon.";
        };
      };
    };
  };

  config = lib.mkIf cfg.cdnCs.enable (
    let
      makeServerTsService = import ../makeServerTsService.nix { inherit cfg lib secrets; };
    in
    {
      assertions = [
        (import ./assert-has-connection-string.nix "Admin API" cfg.adminApi.extraConfiguration)
      ];

      systemd.services.spacebar-cdn = makeServerTsService {
        description = "Spacebar Server - CDN (C#)";
        environment = builtins.mapAttrs (_: val: builtins.toString val) (
          {
            # things we set by default...
            EVENT_TRANSMISSION = "unix";
            EVENT_SOCKET_PATH = "/run/spacebar/";
          }
          // cfg.extraEnvironment
          // {
            # things we force...
            # CONFIG_PATH = configFile;
            CONFIG_READONLY = 1;
            ASPNETCORE_URLS = "http://0.0.0.0:${toString cfg.cdnEndpoint.localPort}";
            STORAGE_LOCATION = cfg.cdnPath;
            APPSETTINGS_PATH = jsonFormat.generate "appsettings.spacebar-cdn.json" (lib.recursiveUpdate (import ./default-appsettings-json.nix) cfg.cdnCs.extraConfiguration);
          }
        );
        serviceConfig = {
          ExecStart = "${self.packages.${pkgs.stdenv.hostPlatform.system}.Spacebar-AdminApi}/bin/Spacebar.AdminApi";
        };
      };
    }
  );
}
