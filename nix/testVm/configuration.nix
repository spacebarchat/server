{ pkgs, lib, ... }:
{
  networking.hostName = "sbtest";

  services.spacebarchat-server =
    let
      cfg = {
        enable = true;
        apiEndpoint = { useSsl = false; host = "api.sb.localhost"; localPort = 3001; publicPort = 8080; };
        gatewayEndpoint = { useSsl = false; host = "gw.sb.localhost"; localPort = 3002; publicPort = 8080; };
        cdnEndpoint = { useSsl = false; host = "cdn.sb.localhost"; localPort = 3003; publicPort = 8080; };
        nginx.enable = true;
        serverName = "sb.localhost";
        extraEnvironment = {
          DATABASE = "postgres://postgres:postgres@127.0.0.1/spacebar";
          #WEBRTC_PORT_RANGE=60000-61000;
          #PUBLIC_IP=216.230.228.60;
          LOG_REQUESTS = "-200,204,304";
          LOG_VALIDATION_ERRORS = true;
          #DB_LOGGING=true;
          #LOG_GATEWAY_TRACES=true;
          #LOG_PROTO_UPDATES=true;
          #LOG_PROTO_FRECENCY_UPDATES=true;
          #LOG_PROTO_SETTINGS_UPDATES=true;
          #WRTC_PUBLIC_IP=webrtc.old.server.spacebar.chat;
          WRTC_PUBLIC_IP = "216.230.228.19";
          WRTC_PORT_MIN = 60000;
          WRTC_PORT_MAX = 65000;
          WRTC_LIBRARY = "@spacebarchat/medooze-webrtc";
          #WRTC_LIBRARY=mediasoup-spacebar-wrtc;
        };
      };
    in
    lib.trace ("Testing with config: " + builtins.toJSON cfg) cfg;
  services.nginx.enable = true;

  users.users.root.initialPassword = "root";
  services.getty.autologinUser = "root";

  environment.systemPackages = with pkgs; [
    btop
    duf
    lnav
  ];
}
