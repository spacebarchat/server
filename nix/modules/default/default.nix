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
        endpointPublic = "http${if cfg.apiEndpoint.useSsl then "s" else ""}://${cfg.apiEndpoint.host}:${toString cfg.apiEndpoint.publicPort}";
      };
      cdn = {
        endpointPublic = "http${if cfg.cdnEndpoint.useSsl then "s" else ""}://${cfg.cdnEndpoint.host}:${toString cfg.cdnEndpoint.publicPort}";
        endpointPrivate = "http://127.0.0.1:${toString cfg.cdnEndpoint.localPort}";
      };
      gateway = {
        endpointPublic = "ws${if cfg.gatewayEndpoint.useSsl then "s" else ""}://${cfg.gatewayEndpoint.host}:${toString cfg.gatewayEndpoint.publicPort}";
      };
      general = {
        serverName = cfg.serverName;
      };
    } cfg.settings
  );
in
{
  imports = [
    ./integration-nginx.nix
    ./secrets.nix
    ./users.nix
  ];
  options.services.spacebarchat-server =
    let
      mkEndpointOptions = import ./options-subtypes/mkEndpointOptions.nix { inherit lib; };
    in
    {
      enable = lib.mkEnableOption "Spacebar server";
      enableAdminApi = lib.mkEnableOption "Spacebar server Admin API";
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
            environment =
              { }
              // (if cfg.cdnSignaturePath != null then { CDN_SIGNATURE_PATH = "%d/cdnSignature"; } else { })
              // (if cfg.legacyJwtSecretPath != null then { LEGACY_JWT_SECRET_PATH = "%d/legacyJwtSecret"; } else { })
              // (if cfg.mailjetApiKeyPath != null then { MAILJET_API_KEY_PATH = "%d/mailjetApiKey"; } else { })
              // (if cfg.mailjetApiSecretPath != null then { MAILJET_API_SECRET_PATH = "%d/mailjetApiSecret"; } else { })
              // (if cfg.smtpPasswordPath != null then { SMTP_PASSWORD_PATH = "%d/smtpPassword"; } else { })
              // (if cfg.gifApiKeyPath != null then { GIF_API_KEY_PATH = "%d/gifApiKey"; } else { })
              // (if cfg.rabbitmqHostPath != null then { RABBITMQ_HOST_PATH = "%d/rabbitmqHost"; } else { })
              // (if cfg.abuseIpDbApiKeyPath != null then { ABUSE_IP_DB_API_KEY_PATH = "%d/abuseIpDbApiKey"; } else { })
              // (if cfg.captchaSecretKeyPath != null then { CAPTCHA_SECRET_KEY_PATH = "%d/captchaSecretKey"; } else { })
              // (if cfg.captchaSiteKeyPath != null then { CAPTCHA_SITE_KEY_PATH = "%d/captchaSiteKey"; } else { })
              // (if cfg.ipdataApiKeyPath != null then { IPDATA_API_KEY_PATH = "%d/ipdataApiKey"; } else { })
              // (if cfg.requestSignaturePath != null then { REQUEST_SIGNATURE_PATH = "%d/requestSignature"; } else { });
            serviceConfig = {
              LoadCredential =
                [ ]
                ++ (if cfg.cdnSignaturePath != null then [ "cdnSignature:${cfg.cdnSignaturePath}" ] else [ ])
                ++ (if cfg.legacyJwtSecretPath != null then [ "legacyJwtSecret:${cfg.legacyJwtSecretPath}" ] else [ ])
                ++ (if cfg.mailjetApiKeyPath != null then [ "mailjetApiKey:${cfg.mailjetApiKeyPath}" ] else [ ])
                ++ (if cfg.mailjetApiSecretPath != null then [ "mailjetApiSecret:${cfg.mailjetApiSecretPath}" ] else [ ])
                ++ (if cfg.smtpPasswordPath != null then [ "smtpPassword:${cfg.smtpPasswordPath}" ] else [ ])
                ++ (if cfg.gifApiKeyPath != null then [ "gifApiKey:${cfg.gifApiKeyPath}" ] else [ ])
                ++ (if cfg.rabbitmqHostPath != null then [ "rabbitmqHost:${cfg.rabbitmqHostPath}" ] else [ ])
                ++ (if cfg.abuseIpDbApiKeyPath != null then [ "abuseIpDbApiKey:${cfg.abuseIpDbApiKeyPath}" ] else [ ])
                ++ (if cfg.captchaSecretKeyPath != null then [ "captchaSecretKey:${cfg.captchaSecretKeyPath}" ] else [ ])
                ++ (if cfg.captchaSiteKeyPath != null then [ "captchaSiteKey:${cfg.captchaSiteKeyPath}" ] else [ ])
                ++ (if cfg.ipdataApiKeyPath != null then [ "ipdataApiKey:${cfg.ipdataApiKeyPath}" ] else [ ])
                ++ (if cfg.requestSignaturePath != null then [ "requestSignature:${cfg.requestSignaturePath}" ] else [ ]);

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
        #        {
        #          assertion = lib.all (map (key: !(key == "CONFIG_PATH" || key == "CONFIG_READONLY" || key == "PORT" || key == "STORAGE_LOCATION")) (lib.attrNames cfg.extraEnvironment));
        #          message = "You cannot set CONFIG_PATH, CONFIG_READONLY, PORT or STORAGE_LOCATION in extraEnvironment, these are managed by the NixOS module.";
        #        }
      ];

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
          }
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
            EVENT_SOCKET_PATH = "/run/spacebar/";
          }
          // cfg.extraEnvironment
          // {
            # things we force...
            CONFIG_PATH = configFile;
            CONFIG_READONLY = 1;
            PORT = toString cfg.cdnEndpoint.localPort;
            STORAGE_LOCATION = cfg.cdnPath;
          }
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-cdn";
        };
      };
    }
  );
}
