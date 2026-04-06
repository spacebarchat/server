self:
{
  config,
  lib,
  pkgs,
  spacebar,
  ...
}:

let
  cfg = config.services.spacebarchat-server;
  configFile = (import ./config-file.nix { inherit config lib pkgs; });
  makeServerTsService = import ../../lib/makeServerTsService.nix { inherit cfg lib; };
in
{
  options.services.spacebarchat-server = {
    extraGatewayPorts = lib.mkOption {
      type = lib.types.listOf lib.types.port;
      description = "Extra gateway ports";
      default = [ ];
    };
  };

  config = lib.mkIf cfg.enable {
    systemd.services = builtins.listToAttrs (
      map (port: {
        name = "spacebar-gateway-${toString port}";
        value = makeServerTsService {
          description = "Spacebar Server - Gateway (extra port ${toString port})";
          # after = [ "spacebar-api.service" ];
          environment = builtins.mapAttrs (_: val: builtins.toString val) (
            {
              # things we set by default...
              EVENT_TRANSMISSION = "unix";
              EVENT_SOCKET_PATH = "/run/spacebar/";
            }
            // cfg.extraEnvironment
            // {
              # things we force...
              CONFIG_PATH = configFile;
              CONFIG_READONLY = 1;
              PORT = toString port;
              STORAGE_LOCATION = cfg.cdnPath;
              APPLY_DB_MIGRATIONS = "false";
            }
          );
          serviceConfig = {
            ExecStart = "${cfg.package}/bin/start-gateway";
          };
        };
      }) cfg.extraGatewayPorts
    );
  };
}
