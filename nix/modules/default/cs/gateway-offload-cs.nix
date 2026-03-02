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
  options.services.spacebarchat-server.gatewayOffload = lib.mkOption {
    default = { };
    description = "Configuration for C# gateway offload daemon.";
    type = lib.types.submodule {
      options = {
        enable = lib.mkEnableOption "Enable gateway offload daemon (C#).";
        listenPort = lib.mkOption {
          type = lib.types.port;
          default = 3011;
          description = "Port for the gateway offload daemon to listen on.";
        };
        extraConfiguration = lib.mkOption {
          type = jsonFormat.type;
          default = import ./default-appsettings-json.nix;
          description = "Extra appsettings.json configuration for the gateway offload daemon.";
        };
        enableIdentify = lib.mkEnableOption "Enable offloading gateway opcode 2 (IDENTIFY).";
        enableGuildSync = lib.mkEnableOption "Enable offloading gateway opcode 12 (GUILD_SYNC).";
        enableLazyRequest = lib.mkEnableOption "Enable offloading gateway opcode 12 (LAZY_REQUEST).";
      };
    };
  };

  config = lib.mkIf cfg.gatewayOffload.enable (
    let
      makeServerTsService = import ../makeServerTsService.nix { inherit cfg lib secrets; };
    in
    {
      assertions = [
        (import ./assert-has-connection-string.nix "Gateway Offload" cfg.gatewayOffload.extraConfiguration)
      ];

      services.spacebarchat-server.settings.offload = {
        gateway = {
          op2BaseUrl = lib.mkIf cfg.gatewayOffload.enableIdentify "http://127.0.0.1:${builtins.toString cfg.gatewayOffload.listenPort}";
          op12BaseUrl = lib.mkIf cfg.gatewayOffload.enableGuildSync "http://127.0.0.1:${builtins.toString cfg.gatewayOffload.listenPort}";
          op14BaseUrl = lib.mkIf cfg.gatewayOffload.enableLazyRequest "http://127.0.0.1:${builtins.toString cfg.gatewayOffload.listenPort}";
        };
      };

      systemd.services.spacebar-cs-gateway-offload = makeServerTsService {
        description = "Spacebar Server - C# Gateway offload";
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
            ASPNETCORE_URLS = "http://0.0.0.0:${toString cfg.gatewayOffload.listenPort}";
            STORAGE_LOCATION = cfg.cdnPath;
            APPSETTINGS_PATH = jsonFormat.generate "appsettings.spacebar-gateway-offload.json" (
              lib.recursiveUpdate (import ./default-appsettings-json.nix) cfg.gatewayOffload.extraConfiguration
            );
          }
        );
        serviceConfig = {
          ExecStart = "${self.packages.${pkgs.stdenv.hostPlatform.system}.Spacebar-GatewayOffload}/bin/Spacebar.GatewayOffload";
        };
      };
    }
  );
}
