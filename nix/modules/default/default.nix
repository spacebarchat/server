self:
{
  config,
  lib,
  pkgs,
  spacebar,
  ...
}:

let
  secrets = import ../../lib/secrets.nix { inherit lib config cfg; };
  cfg = config.services.spacebarchat-server;
  jsonFormat = pkgs.formats.json { };
  configFile = (import ./config-file.nix { inherit config lib pkgs; });
  sbOptions = import ../../lib/options.nix { inherit lib; };
  makeServerTsService = import ../../lib/makeServerTsService.nix { inherit cfg lib; };
in
{
  imports = [
    ./integration-nginx.nix
    ./integration-prometheus.nix
    ./users.nix
    (import ./gw-sharding.nix self)
    (import ./pion-sfu.nix self)
    (import ./cs/cdn-cs.nix self)
    (import ./cs/offload-cs.nix self)
    (import ./cs/admin-api.nix self)
    (import ./cs/uapi.nix self)
  ];
  options.services.spacebarchat-server = {
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
    apiEndpoint = sbOptions.mkEndpointOption "api.sb.localhost" 3001;
    gatewayEndpoint = sbOptions.mkEndpointOption "gateway.sb.localhost" 3003;
    cdnEndpoint = sbOptions.mkEndpointOption "cdn.sb.localhost" 3003;
    adminApiEndpoint = sbOptions.mkEndpointOption "admin-api.sb.localhost" 3004;
    webrtcEndpoint = sbOptions.mkEndpointOption "voice.sb.localhost" 3005;

    cdnPath = lib.mkOption {
      type = lib.types.str;
      default = "./files";
      description = "Path to store CDN files.";
    };

    ipcMethod = lib.mkOption {
      type = lib.types.enum [
        "unix"
        "rabbitmq-single"
        "rabbitmq-legacy"
      ];
      default = "unix";
      description = ''
        How messages should be passed between services.
        Note that the C# services (eg. Admin API) currently only supports the "unix" method!
        Read more at https://docs.spacebar.chat/setup/server/installation/generic/ipc/.
      '';
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
  }
  // secrets.options;

  config = lib.mkIf cfg.enable {
    services.spacebarchat-server.uApi.extraConfiguration.Spacebar.UApi.FallbackApiEndpoint = "http://127.0.0.1:${toString cfg.apiEndpoint.localPort}";

    systemd.services.spacebar-api = makeServerTsService {
      description = "Spacebar Server - API";
      environment = builtins.mapAttrs (_: val: builtins.toString val) (
        {
          # things we set by default...
          EVENT_SOCKET_PATH = "/run/spacebar/";
        }
        // cfg.extraEnvironment
        // {
          # things we force...
          CONFIG_PATH = configFile;
          CONFIG_READONLY = 1;
          PORT = toString cfg.apiEndpoint.localPort;
          STORAGE_LOCATION = cfg.cdnPath;
          EVENT_TRANSMISSION = cfg.ipcMethod;
        }
      );
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/start-api";
        Type = "notify";
      };
    };

    systemd.services.spacebar-gateway = makeServerTsService {
      description = "Spacebar Server - Gateway";
      # after = [ "spacebar-api.service" ];
      environment = builtins.mapAttrs (_: val: builtins.toString val) (
        {
          # things we set by default...
          EVENT_SOCKET_PATH = "/run/spacebar/";
        }
        // cfg.extraEnvironment
        // {
          # things we force...
          CONFIG_PATH = configFile;
          CONFIG_READONLY = 1;
          PORT = toString cfg.gatewayEndpoint.localPort;
          STORAGE_LOCATION = cfg.cdnPath;
          EVENT_TRANSMISSION = cfg.ipcMethod;
          APPLY_DB_MIGRATIONS = "false";
        }
      );
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/start-gateway";
        Type = "notify";
      };
    };

    systemd.services.spacebar-cdn = lib.mkIf (!cfg.cdnCs.enable) (makeServerTsService {
      description = "Spacebar Server - CDN";
      environment = builtins.mapAttrs (_: val: builtins.toString val) (
        {
          # things we set by default...
          EVENT_SOCKET_PATH = "/run/spacebar/";
        }
        // cfg.extraEnvironment
        // {
          # things we force...
          CONFIG_PATH = configFile;
          CONFIG_READONLY = 1;
          PORT = toString cfg.cdnEndpoint.localPort;
          STORAGE_LOCATION = cfg.cdnPath;
          EVENT_TRANSMISSION = cfg.ipcMethod;
          APPLY_DB_MIGRATIONS = "false";
        }
      );
      serviceConfig = {
        ExecStart = "${cfg.package}/bin/start-cdn";
        Type = "notify";
      };
    });
  };
}
