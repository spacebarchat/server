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
      makeServerTsService = (
        conf:
        lib.recursiveUpdate
          (lib.recursiveUpdate {
            documentation = [ "https://docs.spacebar.chat/" ];
            wantedBy = [ "multi-user.target" ];
            wants = [ "network-online.target" ];
            after = [ "network-online.target" ];
            environment = secrets.systemdEnvironment;
            serviceConfig = {
              LoadCredential = secrets.systemdLoadCredentials;

              User = "spacebarchat";
              Group = "spacebarchat";
              DynamicUser = false;

              LockPersonality = true;
              NoNewPrivileges = true;

              ProtectClock = true;
              ProtectControlGroups = true;
              ProtectHostname = true;
              ProtectKernelLogs = true;
              ProtectKernelModules = true;
              ProtectKernelTunables = true;
              PrivateDevices = true;
              PrivateMounts = true;
              PrivateUsers = true;
              RestrictAddressFamilies = [
                "AF_INET"
                "AF_INET6"
                "AF_UNIX"
              ];
              RestrictNamespaces = true;
              RestrictRealtime = true;
              SystemCallArchitectures = "native";
              SystemCallFilter = [
                "@system-service"
                "~@privileged"
                "@chown" # Required for copying files with FICLONE, apparently.
              ];
              CapabilityBoundingSet = [
                "~CAP_SYS_ADMIN"
                "~CAP_AUDIT_*"
                "~CAP_NET_(BIND_SERVICE|BROADCAST|RAW)"
                "~CAP_NET_ADMIN" # No use for this as we don't currently use iptables for enforcing instance bans
                "~CAP_SYS_TIME"
                "~CAP_KILL"
                "~CAP_(DAC_*|FOWNER|IPC_OWNER)"
                "~CAP_LINUX_IMMUTABLE"
                "~CAP_IPC_LOCK"
                "~CAP_BPF"
                "~CAP_SYS_TTY_CONFIG"
                "~CAP_SYS_BOOT"
                "~CAP_SYS_CHROOT"
                "~CAP_BLOCK_SUSPEND"
                "~CAP_LEASE"
                "~CAP_(CHOWN|FSETID|FSETFCAP)" # Check if we need CAP_CHOWN for `fchown()` (FICLONE)?
                "~CAP_SET(UID|GID|PCAP)"
                "~CAP_MAC_*"
                "~CAP_SYS_PTRACE"
                "~CAP_SYS_(NICE|RESOURCE)"
                "~CAP_SYS_RAWIO"
                "~CAP_SYSLOG"
              ];
              RestrictSUIDSGID = true;

              WorkingDirectory = "/var/lib/spacebar";
              StateDirectory = "spacebar";
              StateDirectoryMode = "0750";
              RuntimeDirectory = "spacebar";
              RuntimeDirectoryMode = "0750";
              ReadWritePaths = [ cfg.cdnPath ];
              NoExecPaths = [ cfg.cdnPath ];

              Restart = "on-failure";
              RestartSec = 10;
              StartLimitBurst = 5;
              UMask = "077";
            }
            // lib.optionalAttrs (cfg.databaseFile != null) { EnvironmentFile = cfg.databaseFile; };
          } conf)
          {
          }
      );
    in
    {
      assertions = [
        {
          assertion =
            cfg.gatewayOffload.extraConfiguration ? ConnectionStrings
            && cfg.gatewayOffload.extraConfiguration.ConnectionStrings ? Spacebar
            && cfg.gatewayOffload.extraConfiguration.ConnectionStrings.Spacebar != null;
          message = ''
            Gateway Offload: Setting a database connection string in extraConfiguration (`extraConfiguration.ConnectionStrings.Spacebar`) is required when using C# services.
            Example: Host=127.0.0.1; Username=Spacebar; Password=SuperSecurePassword12; Database=spacebar; Port=5432; Include Error Detail=true; Maximum Pool Size=1000; Command Timeout=6000; Timeout=600;
          '';
        }
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
            APPSETTINGS_PATH = jsonFormat.generate "appsettings.spacebar-gateway-offload.json" (lib.recursiveUpdate (import ./default-appsettings-json.nix) cfg.gatewayOffload.extraConfiguration);
          }
        );
        serviceConfig = {
          ExecStart = "${self.packages.${pkgs.stdenv.hostPlatform.system}.Spacebar-GatewayOffload}/bin/Spacebar.GatewayOffload";
        };
      };
    }
  );
}
