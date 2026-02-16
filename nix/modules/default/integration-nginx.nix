{
  config,
  lib,
  pkgs,
  ...
}:

let
  cfg = config.services.spacebarchat-server;
in
{
  options.services.spacebarchat-server.nginx = {
    enable = lib.mkEnableOption "nginx integration";
  };

  config = lib.mkIf (cfg.enable && cfg.nginx.enable) {
    services.nginx = {
      virtualHosts = lib.mkIf cfg.enable {
        "${cfg.apiEndpoint.host}" = {
          enableACME = cfg.apiEndpoint.useSsl;
          forceSSL = cfg.apiEndpoint.useSsl;
          locations."/" = {
            proxyPass = "http://127.0.0.1:${toString cfg.apiEndpoint.localPort}/";
          };
        };
        "${cfg.gatewayEndpoint.host}" = {
          enableACME = cfg.gatewayEndpoint.useSsl;
          forceSSL = cfg.gatewayEndpoint.useSsl;
          locations."/" = {
            proxyWebsockets = true;
            proxyPass = "http://127.0.0.1:${toString cfg.gatewayEndpoint.localPort}/";
          };
        };
        "${cfg.cdnEndpoint.host}" = {
          enableACME = cfg.cdnEndpoint.useSsl;
          forceSSL = cfg.cdnEndpoint.useSsl;
          locations."/" = {
            proxyPass = "http://127.0.0.1:${toString cfg.cdnEndpoint.localPort}/";
          };
        };
        "${cfg.adminApiEndpoint.host}" = lib.mkIf cfg.adminApi.enable {
          enableACME = cfg.adminApiEndpoint.useSsl;
          forceSSL = cfg.adminApiEndpoint.useSsl;
          locations."/" = {
            proxyPass = "http://127.0.0.1:${toString cfg.adminApiEndpoint.localPort}/";
          };
        };
      };
    };
  };
}
