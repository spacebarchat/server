{
  config,
  lib,
  pkgs
}:

let
  cfg = config.services.spacebarchat-server;
  jsonFormat = pkgs.formats.json { };
in
let
  endpointSettings = {
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
  }
  // (
    if cfg.adminApi.enable then
      {
        adminApi = {
          endpointPublic = "http${if cfg.adminApiEndpoint.useSsl then "s" else ""}://${cfg.adminApiEndpoint.host}:${toString cfg.adminApiEndpoint.publicPort}";
        };
      }
    else
      { }
  );
in
jsonFormat.generate "spacebarchat-server.json" (lib.recursiveUpdate endpointSettings cfg.settings)
