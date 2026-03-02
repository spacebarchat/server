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
  options.services.spacebarchat-server.adminApi = lib.mkOption {
    default = { };
    description = "Configuration for admin api.";
    type = lib.types.submodule {
      options = {
        enable = lib.mkEnableOption "Enable admin api.";
        extraConfiguration = lib.mkOption {
          type = jsonFormat.type;
          default = import ./default-appsettings-json.nix;
          description = "Extra appsettings.json configuration for the gateway offload daemon.";
        };
      };
    };
  };

  config = lib.mkIf cfg.adminApi.enable (
    let
      makeServerTsService = import ../makeServerTsService.nix { inherit cfg lib secrets; };
    in
    {
      assertions = [
        (import ./assert-has-connection-string.nix "Admin API" cfg.adminApi.extraConfiguration)
      ];

      services.spacebarchat-server.settings.admin = {
        endpointPublic = "http${if cfg.adminApiEndpoint.useSsl then "s" else ""}://${cfg.adminApiEndpoint.host}:${toString cfg.adminApiEndpoint.publicPort}";
        endpointPrivate = "http://127.0.0.1:${builtins.toString cfg.adminApiEndpoint.localPort}";
      };

      systemd.services.spacebar-admin-api = makeServerTsService {
        description = "Spacebar Server - Admin API";
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
            ASPNETCORE_URLS = "http://0.0.0.0:${toString cfg.adminApiEndpoint.localPort}";
            STORAGE_LOCATION = cfg.cdnPath;
            APPSETTINGS_PATH = jsonFormat.generate "appsettings.spacebar-adminapi.json" (lib.recursiveUpdate (import ./default-appsettings-json.nix) cfg.adminApi.extraConfiguration);
          }
        );
        serviceConfig = {
          ExecStart = "${self.packages.${pkgs.stdenv.hostPlatform.system}.Spacebar-AdminApi}/bin/Spacebar.AdminApi";
        };
      };
    }
  );
}
