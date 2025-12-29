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
          nginx.enable = true;
          serverName = "sb.localhost";
        };
      in
      lib.trace ("Testing with config: " + builtins.toJSON cfg) cfg;
    services.nginx.enable = true;
  };

  testScript = ''
    machine.wait_for_unit("spacebar-api")
    machine.wait_for_unit("spacebar-cdn")
    machine.wait_for_unit("spacebar-gateway")
    # machine.succeed("curl -f http://api.sb.localhost/.well-known/spacebar/client")
  '';
}
