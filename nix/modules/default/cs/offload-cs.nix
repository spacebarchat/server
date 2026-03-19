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
  offloadCfg = cfg.offload;
  jsonFormat = pkgs.formats.json { };
in
{
  imports = [ ];
  options.services.spacebarchat-server.offload = lib.mkOption {
    default = { };
    description = "Configuration for C# offload daemon.";
    type = lib.types.submodule {
      options = {
        enable = lib.mkEnableOption "Enable offload daemon (C#).";
        listenPort = lib.mkOption {
          type = lib.types.port;
          default = 3011;
          description = "Port for the offload daemon to listen on.";
        };
        extraConfiguration = lib.mkOption {
          type = jsonFormat.type;
          default = import ./default-appsettings-json.nix;
          description = "Extra appsettings.json configuration for the offload daemon.";
        };
        gateway = lib.mkOption {
          description = "Gateway offloads";
          type = lib.types.submodule {
            options = {
              enableIdentify = lib.mkEnableOption "Enable offloading gateway opcode 2 (IDENTIFY).";
              enableGuildMembers = lib.mkEnableOption "Enable offloading gateway opcode 8 (REQUEST_GUILD_MEMBERS).";
              enableGuildSync = lib.mkEnableOption "Enable offloading gateway opcode 12 (GUILD_SYNC).";
              enableLazyRequest = lib.mkEnableOption "Enable offloading gateway opcode 14 (LAZY_REQUEST).";
              enableChannelStatuses = lib.mkEnableOption "Enable offloading gateway opcode 36 (CHANNEL_STATUSES).";
              enableChannelInfo = lib.mkEnableOption "Enable offloading gateway opcode 43 (CHANNEL_INFO).";
            };
          };
        };
      };
    };
  };

  config = lib.mkIf offloadCfg.enable (
    let
      makeServerTsService = import ../makeServerTsService.nix { inherit cfg lib secrets; };
    in
    {
      assertions = [
        (import ./assert-has-connection-string.nix "Gateway Offload" offloadCfg.extraConfiguration)
      ];

      services.spacebarchat-server.settings.offload = {
        gateway = {
          identifyUrl = lib.mkIf offloadCfg.gateway.enableIdentify "http://127.0.0.1:${builtins.toString offloadCfg.listenPort}/_spacebar/offload/gateway/Identify";
          guildMembersUrl = lib.mkIf offloadCfg.gateway.enableGuildMembers "http://127.0.0.1:${builtins.toString offloadCfg.listenPort}/_spacebar/offload/gateway/GuildMembers";
          guildSyncUrlUrl = lib.mkIf offloadCfg.gateway.enableGuildSync "http://127.0.0.1:${builtins.toString offloadCfg.listenPort}/_spacebar/offload/gateway/GuildSync";
          lazyRequestUrl = lib.mkIf offloadCfg.gateway.enableLazyRequest "http://127.0.0.1:${builtins.toString offloadCfg.listenPort}/_spacebar/offload/gateway/LazyRequest";
          channelStatusesUrl = lib.mkIf offloadCfg.gateway.enableChannelStatuses "http://127.0.0.1:${builtins.toString offloadCfg.listenPort}/_spacebar/offload/gateway/ChannelStatuses";
          channelInfoUrl = lib.mkIf offloadCfg.gateway.enableChannelInfo "http://127.0.0.1:${builtins.toString offloadCfg.listenPort}/_spacebar/offload/gateway/ChannelInfo";
        };
      };

      systemd.services.spacebar-cs-offload = makeServerTsService {
        description = "Spacebar Server - C# offload";
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
            ASPNETCORE_URLS = "http://0.0.0.0:${toString offloadCfg.listenPort}";
            STORAGE_LOCATION = cfg.cdnPath;
            APPSETTINGS_PATH = jsonFormat.generate "appsettings.spacebar-offload.json" (
              lib.recursiveUpdate (import ./default-appsettings-json.nix) offloadCfg.extraConfiguration
            );
          }
        );
        serviceConfig = {
          ExecStart = "${lib.getExe self.packages.${pkgs.stdenv.hostPlatform.system}.Spacebar-Offload}";
        };
      };
    }
  );
}
