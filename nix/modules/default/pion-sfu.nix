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
  secrets = import ./secrets.nix { inherit lib config; };
  configFile = (import ./config-file.nix { inherit config lib pkgs; });
in
{
  options.services.spacebarchat-server.pion-sfu =
    let
      mkEndpointOptions = import ./options-subtypes/mkEndpointOptions.nix { inherit lib; };
    in
    {
      enable = lib.mkEnableOption "Enable Spacebar Pion SFU";
      openFirewall = lib.mkEnableOption "Allow SFU port in firewall";
      package = lib.mkPackageOption self.packages.${pkgs.stdenv.hostPlatform.system} "Pion SFU" { default = "pion-sfu"; };

      publicIp = lib.mkOption {
        type = lib.types.str;
        description = "Public IP address of the server.";
      };
      listenPort = lib.mkOption {
        type = lib.types.port;
        default = 6000;
        description = "UDP port the SFU will listen on.";
      };
    };

  config = lib.mkIf cfg.pion-sfu.enable (
    let
      makeServerTsService = import ./makeServerTsService.nix { inherit cfg lib secrets; };
    in
    {
      networking.firewall.allowedUDPPorts = lib.mkIf cfg.pion-sfu.openFirewall [ cfg.pion-sfu.listenPort ];
      services.spacebarchat-server.settings.regions = {
        default = "default";
        available = [
          {
            id = "default";
            name = "Default Region";
            endpoint = cfg.webrtcEndpoint.host + ":" + toString cfg.webrtcEndpoint.publicPort;
            vip = false;
            custom = false;
            deprecated = false;
          }
        ];
      };

      systemd.services.spacebar-webrtc = makeServerTsService {
        description = "Spacebar Server - WebRTC";
        requires = [ "spacebar-sfu.service" ];
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
            PORT = toString cfg.webrtcEndpoint.localPort;
            APPLY_DB_MIGRATIONS = "false";
            WRTC_LIBRARY = "@spacebarchat/pion-webrtc";
            WRTC_PUBLIC_IP = cfg.pion-sfu.publicIp;
            WRTC_PORT_MIN = toString cfg.pion-sfu.listenPort;
            WRTC_PORT_MAX = toString cfg.pion-sfu.listenPort;
          }
        );
        serviceConfig = {
          ExecStart = "${cfg.package}/bin/start-webrtc";
        };
      };

      systemd.services.spacebar-sfu = makeServerTsService {
        description = "Spacebar Server - Pion SFU";
        serviceConfig = {
          ExecStart = "${lib.getExe cfg.pion-sfu.package} -ip ${cfg.pion-sfu.publicIp} -port ${toString cfg.pion-sfu.listenPort}";
        };
      };
    }
  );
}
