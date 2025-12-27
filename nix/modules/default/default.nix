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
  jsonFormat = pkgs.formats.json { };
  configFile = jsonFormat.generate "spacebarchat-server.json" (
    lib.recursiveUpdate {
      api = {
        endpointPublic = "http${if cfg.apiEndpoint.useSsl then "s" else ""}://${cfg.apiEndpoint.host}:${toString cfg.apiEndpoint.publicPort}/";
      };
      cdn = {
        endpointPublic = "http${if cfg.cdnEndpoint.useSsl then "s" else ""}://${cfg.cdnEndpoint.host}:${toString cfg.cdnEndpoint.publicPort}/";
        endpointPrivate = "http${if cfg.cdnEndpoint.useSsl then "s" else ""}://127.0.0.1:${toString cfg.cdnEndpoint.localPort}/";
      };
      gateway = {
        endpointPublic = "ws${if cfg.gatewayEndpoint.useSsl then "s" else ""}://${cfg.gatewayEndpoint.host}:${toString cfg.gatewayEndpoint.publicPort}/";
      };
      general = {
        serverName = cfg.serverName;
      };
    } cfg.settings
  );
in
{
  imports = [ ./integration-nginx.nix ];
  options.services.spacebarchat-server =
    let
      mkEndpointOptions =
        defaultHost: defaultPort:
        lib.mkOption {
          type = lib.types.submodule {
            options = {
              useSsl = lib.mkEnableOption "Use SSL for this endpoint.";
              host = lib.mkOption {
                type = lib.types.str;
                default = defaultHost;
                description = "Host to bind to.";
              };
              localPort = lib.mkOption {
                type = lib.types.port;
                default = defaultPort;
                description = "Port to bind to.";
              };
              publicPort = lib.mkOption {
                type = lib.types.port;
                default = 443;
                description = "Public port to use in .well-known, defaults to 443.";
              };
            };
          };
          default = { };
        };
    in
    {
      enable = lib.mkEnableOption "Spacebar server";
      package = lib.mkPackageOption self.packages.${pkgs.stdenv.hostPlatform.system} "spacebar-server" { default = "default"; };
      databaseFile = lib.mkOption {
        type = lib.types.nullOr lib.types.path;
        default = null;
        description = ''
          Path to a file containing a definition of the `DATABASE` environment variable database connection string.
          Example content: `DATABASE=postgres://username:password@host-IP:port/databaseName`.
          See https://docs.spacebar.chat/setup/server/database/.
        '';
      };

      serverName = lib.mkOption {
        type = lib.types.str;
        description = "The server name for this Spacebar instance (aka. common name, usually the domain where your well known is hosted).";
      };
      apiEndpoint = mkEndpointOptions "api.sb.localhost" 3001;
      gatewayEndpoint = mkEndpointOptions "gateway.sb.localhost" 3003;
      cdnEndpoint = mkEndpointOptions "cdn.sb.localhost" 3003;
      cdnPath = lib.mkOption {
        type = lib.types.nullOr lib.types.str;
        description = "Path to store CDN files.";
      };

      extraEnvironment = lib.mkOption {
        default = { };
        description = ''
          Environment variables passed to spacebarchat-server.
          See https://docs.spacebar.chat/setup/server/configuration/env for supported values.
        '';
        type = lib.types.submodule {
          freeformType =
            with lib.types;
            attrsOf (oneOf [
              str
              bool
              int
            ]);
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
        default = { };
        description = ''
          Configuration for spacebarchat-server.
          See https://docs.spacebar.chat/setup/server/configuration for supported values.
        '';
      };
    };

  config = lib.mkIf cfg.enable (
    let
      makeServerTsService = (
        conf:
        lib.recursiveUpdate
          (lib.recursiveUpdate {
            documentation = [ "https://docs.spacebar.chat/" ];
            wantedBy = [ "multi-user.target" ];
            wants = [ "network-online.target" ];
            after = [ "network-online.target" ];
            serviceConfig = {
              User = "spacebarchat";
              Group = "spacebarchat";
              DynamicUser = true;
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
                "AF_UNIX"
              ];
              RestrictNamespaces = true;
              RestrictRealtime = true;
              SystemCallArchitectures = "native";
              SystemCallFilter = [
                "@system-service"
                "~@privileged"
              ];
              StateDirectory = "spacebar-server";
              StateDirectoryMode = "0700";
              RuntimeDirectory = "spacebarchat";
              RuntimeDirectoryMode = "0750";

              Restart = "on-failure";
              RestartSec = 10;
              StartLimitBurst = 5;
              UMask = "077";
              # WorkingDirectory = "/var/lib/spacebarchat-server/";
            }
            // lib.optionalAttrs (cfg.databaseFile != null) { EnvironmentFile = cfg.databaseFile; };
          } conf)
          {
          }
      );
    in
    {
      assertions = [
        #        {
        #          assertion = !((cfg.extraEnvironment.THREADS > 1) && !config.services.rabbitmq.enable);
        #          message = "Make sure you've setup RabbitMQ when using more than one thread with Spacebar";
        #        }
      ];

#      systemd.tmpfiles.rules = [ "d /run/spacebarchat 0750 spacebar spacebar" ];

      systemd.services.spacebar-api = makeServerTsService {
        description = "Spacebar Server - API";
        environment = builtins.mapAttrs (_: val: builtins.toString val) (
          {
            # things we set by default...
            EVENT_TRANSMISSION = "unix";
            EVENT_SOCKET_PATH = "/run/spacebarchat/";
          }
          // cfg.extraEnvironment
          // {
            # things we force...
            CONFIG_PATH = configFile;
            CONFIG_READONLY = 1;
          }
          // (
            if cfg.cdnPath != null then
              {
                STORAGE_LOCATION = cfg.cdnPath;
              }
            else
              { }
          )
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-api";
        };
      };

      systemd.services.spacebar-gateway = makeServerTsService {
        description = "Spacebar Server - Gateway";
        environment = builtins.mapAttrs (_: val: builtins.toString val) (
          {
            # things we set by default...
            EVENT_TRANSMISSION = "unix";
            EVENT_SOCKET_PATH = "/run/spacebarchat/";
          }
          // cfg.extraEnvironment
          // {
            # things we force...
            CONFIG_PATH = configFile;
            CONFIG_READONLY = 1;
          }
          // (
            if cfg.cdnPath != null then
              {
                STORAGE_LOCATION = cfg.cdnPath;
              }
            else
              { }
          )
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-gateway";
        };
      };

      systemd.services.spacebar-cdn = makeServerTsService {
        description = "Spacebar Server - CDN";
        environment = builtins.mapAttrs (_: val: builtins.toString val) (
          {
            # things we set by default...
            EVENT_TRANSMISSION = "unix";
            EVENT_SOCKET_PATH = "/run/spacebarchat/";
          }
          // cfg.extraEnvironment
          // {
            # things we force...
            CONFIG_PATH = configFile;
            CONFIG_READONLY = 1;
          }
          // (
            if cfg.cdnPath != null then
              {
                STORAGE_LOCATION = cfg.cdnPath;
              }
            else
              { }
          )
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-cdn";
        };
      };
    }
  );
}
