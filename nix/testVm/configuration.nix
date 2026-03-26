{
  config,
  pkgs,
  lib,
  ...
}:
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
  services.nginx.virtualHosts.${config.services.spacebarchat-server.serverName} = nginxTestSigning;
  services.nginx.virtualHosts.${config.services.spacebarchat-server.adminApiEndpoint.host} = nginxTestSigning;
  services.nginx.virtualHosts.${config.services.spacebarchat-server.apiEndpoint.host} = nginxTestSigning;
  services.nginx.virtualHosts.${config.services.spacebarchat-server.cdnEndpoint.host} = nginxTestSigning;
  services.nginx.virtualHosts.${config.services.spacebarchat-server.gatewayEndpoint.host} = nginxTestSigning;
  services.nginx.virtualHosts.${config.services.spacebarchat-server.webrtcEndpoint.host} = nginxTestSigning;

  services.spacebarchat-server =
    let
      sbLib = import ../modules/default/lib.nix;
      csConnectionString = "Host=127.0.0.1; Username=postgres; Password=postgres; Database=spacebar; Port=5432; Include Error Detail=true; Maximum Pool Size=1000; Command Timeout=6000; Timeout=600;";
      cfg = {
        enable = true;
        apiEndpoint = sbLib.mkEndpointRaw "api.sb.localhost" 3001 8080 false;
        gatewayEndpoint = sbLib.mkEndpointRaw "gw.sb.localhost" 3002 8080 false;
        extraGatewayPorts = lib.range 3100 3103; # 4 gateways total
        cdnEndpoint = sbLib.mkEndpointRaw "cdn.sb.localhost" 3003 8080 false;
        adminApiEndpoint = sbLib.mkEndpointRaw "admin.sb.localhost" 3004 8080 false;
        webrtcEndpoint = sbLib.mkEndpointRaw "voice.sb.localhost" 3005 8080 false;
        nginx.enable = true;
        serverName = "sb.localhost";
        settings = {
          security = {
            requestSignature = "meow";
            cdnSignatureDuration = "5m";
            cdnSignatureIncludeIp = true;
            cdnSignatureIncludeUserAgent = false;
            cdnSignatureKey = "meow";
          };
          limits = {
            absoluteRate = {
              register.enabled = false;
              sendMessage.enabled = false;
            };
          };
          embeds = {
            youtube = {
              userAgent = "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)";
            };
          };
        };

        offload = {
          enable = true;
          gateway = {
            enableIdentify = true;
            enableGuildMembers = true;
            enableGuildSync = true;
            enableLazyRequest = true;
            enableChannelStatuses = true;
            enableChannelInfo = true;
          };
          extraConfiguration.ConnectionStrings.Spacebar = csConnectionString;
        };

        adminApi = {
          enable = true;
          extraConfiguration.ConnectionStrings.Spacebar = csConnectionString;
        };

        cdnCs = {
          enable = false;
          extraConfiguration.ConnectionStrings.Spacebar = csConnectionString;
        };

        uApi = {
          enable = true;
          extraConfiguration.ConnectionStrings.Spacebar = csConnectionString;
        };

        pion-sfu = {
          enable = true;
          publicIp = "127.0.0.1";
        };

        extraEnvironment = {
          DATABASE = "postgres://postgres:postgres@127.0.0.1/spacebar";
          # LOG_REQUESTS = "-200,204,304";
          LOG_REQUESTS = "-";
          LOG_VALIDATION_ERRORS = true;
          #DB_LOGGING=true;
          #LOG_GATEWAY_TRACES=true;
          #LOG_PROTO_UPDATES=true;
          #LOG_PROTO_FRECENCY_UPDATES=true;
          #LOG_PROTO_SETTINGS_UPDATES=true;
        };
      };
    in
    lib.trace ("Testing with config: " + builtins.toJSON cfg) cfg;
  services.nginx.enable = true;
  services.nginx.recommendedOptimisation = true;
  services.nginx.appendConfig = ''
    worker_processes 6;
  '';
  services.nginx.eventsConfig = ''
    worker_connections 512;
  '';

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
