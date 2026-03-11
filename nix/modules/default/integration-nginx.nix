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
      recommendedProxySettings = true;
      upstreams = {
        "spacebar-api" = {
          servers = {
            "127.0.0.1:${if cfg.uApi.enable then toString cfg.uApi.listenPort else toString cfg.apiEndpoint.localPort}" = { };
          };
        };
        "spacebar-gateway" = {
          servers = {
            "127.0.0.1:${toString cfg.gatewayEndpoint.localPort}" = { };
          }
          // builtins.listToAttrs (
            map (port: {
              name = "127.0.0.1:${toString port}";
              value = { };
            }) cfg.extraGatewayPorts
          );
        };
        "spacebar-cdn" = {
          servers = {
            "127.0.0.1:${toString cfg.cdnEndpoint.localPort}" = { };
          };
        };
        "spacebar-admin" = lib.mkIf cfg.adminApi.enable {
          servers = {
            "127.0.0.1:${toString cfg.adminApiEndpoint.localPort}" = { };
          };
        };
      };
      virtualHosts = lib.mkIf cfg.enable {
        "${cfg.apiEndpoint.host}" = {
          enableACME = cfg.apiEndpoint.useSsl;
          forceSSL = cfg.apiEndpoint.useSsl;
          locations."/" = {
            proxyPass = "http://spacebar-api/";
          };
        };
        "${cfg.gatewayEndpoint.host}" = {
          enableACME = cfg.gatewayEndpoint.useSsl;
          forceSSL = cfg.gatewayEndpoint.useSsl;
          locations."/" = {
            proxyWebsockets = true;
            proxyPass = "http://spacebar-gateway/";
          };
        };
        "${cfg.cdnEndpoint.host}" = {
          enableACME = cfg.cdnEndpoint.useSsl;
          forceSSL = cfg.cdnEndpoint.useSsl;
          locations."/" = {
            proxyPass = "http://spacebar-cdn/";
          };
        };
        "${cfg.adminApiEndpoint.host}" = lib.mkIf cfg.adminApi.enable {
          enableACME = cfg.adminApiEndpoint.useSsl;
          forceSSL = cfg.adminApiEndpoint.useSsl;
          locations."/" = {
            proxyPass = "http://spacebar-admin/";
          };
        };
      };
    };
  };
}
