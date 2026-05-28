{
  config,
  lib,
  ...
}:

let
  cfg = config.services.spacebarchat-server;
in
{
  options.services.spacebarchat-server.prometheus = {
    enable = lib.mkEnableOption "prometheus integration";
  };

  config = lib.mkIf (cfg.enable && cfg.prometheus.enable) {
    services.prometheus.scrapeConfigs = [
      {
        job_name = "spacebar-api-${builtins.toString cfg.apiEndpoint.localPort}";
        scrape_interval = "1s";
        static_configs = [
          { targets = [ "localhost:${builtins.toString cfg.apiEndpoint.localPort}" ]; }
        ];
      }
      {
        job_name = "spacebar-gateway-${builtins.toString cfg.gatewayEndpoint.localPort}";
        scrape_interval = "1s";
        static_configs = [
          { targets = [ "localhost:${builtins.toString cfg.gatewayEndpoint.localPort}" ]; }
        ];
      }
      {
        job_name = "spacebar-cdn-${builtins.toString cfg.cdnEndpoint.localPort}";
        scrape_interval = "1s";
        static_configs = [
          { targets = [ "localhost:${builtins.toString cfg.cdnEndpoint.localPort}" ]; }
        ];
      }
    ]
    ++ (lib.map (port: {
      job_name = "spacebar-gateway-${builtins.toString port}";
      scrape_interval = "1s";
      static_configs = [
        { targets = [ "localhost:${builtins.toString port}" ]; }
      ];
    }) cfg.extraGatewayPorts);
  };
}
