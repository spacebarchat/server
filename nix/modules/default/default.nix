self: { config, lib, pkgs, spacebar, ... }:

let
  cfg = config.services.spacebarchat-server;
  jsonFormat = pkgs.formats.json {};
  configFile = jsonFormat.generate "spacebarchat-server.json" cfg.settings;
in
{
  options.services.spacebarchat-server = {
    enable = lib.mkEnableOption "spacebarchat-server";
    package = lib.mkPackageOption self.packages.${pkgs.stdenv.hostPlatform.system} "spacebar-server" { default = "default"; };
    databaseFile = lib.mkOption {
      type = lib.types.nullOr lib.types.path;
      default = null;
      description = ''
        Path to a file containing a definition of the `DATABASE` environment variable database connection string.
        Example content: `DATABASE=postgres//username:password@host-IP:port/databaseName`.
        See https://docs.spacebar.chat/setup/server/database/.
      '';
    };
    extraEnvironment = lib.mkOption {
      default = {};
      description = ''
        Environment variables passed to spacebarchat-server.
        See https://docs.spacebar.chat/setup/server/configuration/env for supported values.
      '';
      type = lib.types.submodule {
        freeformType = with lib.types; attrsOf (oneOf [ str bool ]);
        options = {
          THREADS = lib.mkOption {
            type = lib.types.ints.positive;
            default = 1;
            description = "Number of threads to run Spacebar on when using bundle. Make sure you've enabled RabbitMQ if using more than one.";
          };
          PORT = lib.mkOption {
            type = lib.types.port;
            default = 3001;
            description = "Port to listen on. Used by all components, including bundle. If using bundle, all components run under the same port";
          };
        };
      };
    };

    settings = lib.mkOption {
      type = jsonFormat.type;
      default = {};
      description = ''
        Configuration for spacebarchat-server.
        See https://docs.spacebar.chat/setup/server/configuration for supported values.
      '';
    };
  };

  config = lib.mkIf cfg.enable {
    assertions = [ {
      assertion = !((cfg.extraEnvironment.THREADS > 1) && !config.services.rabbitmq.enable);
      message = "Make sure you've setup RabbitMQ when using more than one thread with Spacebar";
    } ];
  
    systemd.services.spacebarchat-server = {
      description = "Spacebarchat Server";
      documentation = [ "https://docs.spacebar.chat/" ];
      wantedBy = [ "multi-user.target" ];
      wants = [ "network-online.target" ];
      after = [ "network-online.target" ];
      environment = builtins.mapAttrs (_: val: builtins.toString val) (cfg.extraEnvironment // { CONFIG_PATH = configFile; CONFIG_READONLY = 1; });
      serviceConfig = {
        DynamicUser = true;
        User = "spacebarchat-server";
        LockPersonality = true;
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
        ];
        RestrictNamespaces = true;
        RestrictRealtime = true;
        SystemCallArchitectures = "native";
        SystemCallFilter = [
          "@system-service"
          "~@privileged"
        ];
        StateDirectory = "spacebarchat-server";
        StateDirectoryMode = "0700";
        ExecStart = "${cfg.package}/bin/start-bundle";
        Restart = "on-failure";
        RestartSec = 10;
        StartLimitBurst = 5;
        UMask = "077";
        WorkingDirectory = "/var/lib/spacebarchat-server/";
      }
      // optionalAttrs (cfg.databaseFile != null) { EnvironmentFile = cfg.databaseFile; };
    };
  };
}
