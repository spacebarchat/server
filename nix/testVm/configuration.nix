{ pkgs, lib, ... }:
let
  nginxTestSigning = {
    addSSL = true;
    enableACME = false;

    # We don't care about certificates around here...
    sslCertificate = "${pkgs.path}/nixos/tests/common/acme/server/acme.test.cert.pem";
    sslCertificateKey = "${pkgs.path}/nixos/tests/common/acme/server/acme.test.key.pem";
  };
in
{
  networking.hostName = "sbtest";
  services.nginx.virtualHosts."sb.localhost" = nginxTestSigning;
  services.nginx.virtualHosts."api.sb.localhost" = nginxTestSigning;
  services.nginx.virtualHosts."gw.sb.localhost" = nginxTestSigning;
  services.nginx.virtualHosts."cdn.sb.localhost" = nginxTestSigning;

  services.spacebarchat-server =
    let
      cfg = {
        enable = true;
        apiEndpoint = {
          useSsl = false;
          host = "api.sb.localhost";
          localPort = 3001;
          publicPort = 8080;
        };
        gatewayEndpoint = {
          useSsl = false;
          host = "gw.sb.localhost";
          localPort = 3002;
          publicPort = 8080;
        };
        cdnEndpoint = {
          useSsl = false;
          host = "cdn.sb.localhost";
          localPort = 3003;
          publicPort = 8080;
        };
        nginx.enable = true;
        serverName = "sb.localhost";
        gatewayOffload = {
          enable = true;
          enableGuildSync = true;
          extraConfiguration.ConnectionStrings.Spacebar = "Host=127.0.0.1; Username=Spacebar; Password=postgres; Database=spacebar; Port=5432; Include Error Detail=true; Maximum Pool Size=1000; Command Timeout=6000; Timeout=600;";
        };
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
    net-tools
    nethogs
  ];
}
