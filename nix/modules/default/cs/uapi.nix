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
  imports = [
    ./shared-config.nix
  ];
  options.services.spacebarchat-server.uApi = lib.mkOption {
    default = { };
    description = "Configuration for C# API overlay.";
    type = lib.types.submodule {
      options = {
        enable = lib.mkEnableOption "Enable C# API overlay.";
        listenPort = lib.mkOption {
          type = lib.types.port;
          default = 3012;
          description = "Port for the gateway offload daemon to listen on.";
        };
        extraConfiguration = lib.mkOption {
          type = jsonFormat.type;
          default = { };
          description = "Extra appsettings.json configuration for the C# API overlay.";
        };
      };
    };
  };

  config = lib.mkIf cfg.uApi.enable (
    let
      makeServerTsService = import ../makeServerTsService.nix { inherit cfg lib secrets; };
    in
    {
      assertions = [
        (import ./assert-has-connection-string.nix "uAPI" cfg)
      ];

      systemd.services.spacebar-uapi = makeServerTsService {
        description = "Spacebar Server - C# API overlay";
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
            # CONFIG_PATH = configFile;
            CONFIG_READONLY = 1;
            ASPNETCORE_URLS = "http://0.0.0.0:${toString cfg.uApi.listenPort}";
            STORAGE_LOCATION = cfg.cdnPath;
            APPSETTINGS_PATH = jsonFormat.generate "appsettings.spacebar-uapi.json" (lib.recursiveUpdate cfg.cs.defaultAppsettings cfg.uApi.extraConfiguration);
          }
        );
        serviceConfig = {
          ExecStart = "${self.packages.${pkgs.stdenv.hostPlatform.system}.Spacebar-UApi}/bin/Spacebar.UApi";
        };
      };
    }
  );
}
