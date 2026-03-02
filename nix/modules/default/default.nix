self:
{
  config,
  lib,
  pkgs,
  spacebar,
  ...
}:

let
  secrets = import ./secrets.nix { inherit lib config; };
  cfg = config.services.spacebarchat-server;
  jsonFormat = pkgs.formats.json { };
  configFile = (import ./config-file.nix { inherit config lib pkgs; });
in
{
  imports = [
    ./integration-nginx.nix
    ./users.nix
    (import ./pion-sfu.nix self)
    (import ./cs/cdn-cs.nix self)
    (import ./cs/gateway-offload-cs.nix self)
    (import ./cs/admin-api.nix self)
    (import ./cs/uapi.nix self)
  ];
  options.services.spacebarchat-server =
    let
      mkEndpointOptions = import ./options-subtypes/mkEndpointOptions.nix { inherit lib; };
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
      adminApiEndpoint = mkEndpointOptions "admin-api.sb.localhost" 3004;
      webrtcEndpoint = mkEndpointOptions "voice.sb.localhost" 3005;

      cdnPath = lib.mkOption {
        type = lib.types.str;
        default = "./files";
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

  config = lib.mkIf cfg.enable (
    let
      makeServerTsService = import ./makeServerTsService.nix { inherit cfg lib secrets; };
    in
    {
      assertions = [
        #        {
        #          assertion = lib.all (map (key: !(key == "CONFIG_PATH" || key == "CONFIG_READONLY" || key == "PORT" || key == "STORAGE_LOCATION")) (lib.attrNames cfg.extraEnvironment));
        #          message = "You cannot set CONFIG_PATH, CONFIG_READONLY, PORT or STORAGE_LOCATION in extraEnvironment, these are managed by the NixOS module.";
        #        }
      ];
      services.spacebarchat-server.uApi.extraConfiguration.Spacebar.UApi.FallbackApiEndpoint = "http://127.0.0.1:${toString cfg.apiEndpoint.localPort}";

      systemd.services.spacebar-api = makeServerTsService {
        description = "Spacebar Server - API";
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
            PORT = toString cfg.apiEndpoint.localPort;
            STORAGE_LOCATION = cfg.cdnPath;
          }
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-api";
        };
      };

      systemd.services.spacebar-gateway = makeServerTsService {
        description = "Spacebar Server - Gateway";
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
            PORT = toString cfg.gatewayEndpoint.localPort;
            STORAGE_LOCATION = cfg.cdnPath;
            APPLY_DB_MIGRATIONS = "false";
          }
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-gateway";
        };
      };

      systemd.services.spacebar-cdn = lib.mkIf (!cfg.cdnCs.enable) (makeServerTsService {
        description = "Spacebar Server - CDN";
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
            PORT = toString cfg.cdnEndpoint.localPort;
            STORAGE_LOCATION = cfg.cdnPath;
            APPLY_DB_MIGRATIONS = "false";
          }
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-cdn";
        };
      });
    }
  );
}
