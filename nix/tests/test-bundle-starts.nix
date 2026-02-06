self:
{
  config,
  lib,
  pkgs,
  ...
}:

let
  sb = import ../modules/default/lib.nix;
in
{
  name = "test-bundle-starts";

  nodes.machine = {
    imports = [ self.nixosModules.default ];

    services.spacebarchat-server =
      let
        cfg = {
          enable = true;
          apiEndpoint = sb.mkEndpoint "api.sb.localhost" 3001 false;
          gatewayEndpoint = sb.mkEndpoint "gw.sb.localhost" 3002 false;
          cdnEndpoint = sb.mkEndpoint "cdn.sb.localhost" 3003 false;
          serverName = "sb.localhost";
          extraEnvironment = {
            DATABASE = "postgres://postgres:postgres@127.0.0.1/spacebar";
            LOG_REQUESTS = "-"; # Log all requests
            LOG_VALIDATION_ERRORS = true;
          };

          nginx.enable = true;
          gatewayOffload = {
            enable = true;
            enableGuildSync = true;
            extraConfiguration.ConnectionStrings.Spacebar = "Host=127.0.0.1; Username=Spacebar; Password=postgres; Database=spacebar; Port=5432; Include Error Detail=true; Maximum Pool Size=1000; Command Timeout=6000; Timeout=600;";
          };
        };
      in
      lib.trace ("Testing with config: " + builtins.toJSON cfg) cfg;
    services.nginx.enable = true;
    services.postgresql = {
      enable = true;
      initdbArgs = [
        "--encoding=UTF8"
        "--locale=C.UTF-8"
        "--data-checksums"
        "--allow-group-access"
      ];
      enableTCPIP = true;
      authentication = pkgs.lib.mkOverride 10 ''
        # TYPE, DATABASE, USER, ADDRESS, METHOD
        local all all trust
        host all all 127.0.0.1/32 trust
        host all all ::1/128 trust
        host all all 0.0.0.0/0 md5
      '';
      initialScript = pkgs.writeText "backend-initScript" ''
        CREATE ROLE spacebar WITH LOGIN PASSWORD 'spacebar' CREATEDB;
        CREATE DATABASE spacebar;
        GRANT ALL PRIVILEGES ON DATABASE spacebar TO spacebar;
      '';
    };
  };

  testScript = ''
    machine.wait_for_unit("spacebar-api")
    machine.wait_for_unit("spacebar-cdn")
    machine.wait_for_unit("spacebar-gateway")
    # Wait for unit doesn't mean the service is actually ready to accept connections
    machine.wait_for_open_port(80)
    machine.wait_for_open_port(3001)
    machine.wait_for_open_port(3002)
    machine.wait_for_open_port(3003)
    # If well known works, its probably fine(tm)?
    machine.succeed("curl -f http://api.sb.localhost/.well-known/spacebar/client")
  '';
}
