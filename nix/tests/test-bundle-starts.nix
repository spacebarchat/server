self:
{ config, lib, pkgs, ... }:

{
  name = "test-bundle-starts";

  nodes.machine = {
    imports = [ self.nixosModules.default ];

    services.spacebarchat-server = {
        enable = true;
        settings = {
            api = { endpointPublic = "http://localhost:3001/api/v9/"; };
            cdn = { endpointPublic = "http://localhost:3001/"; endpointPrivate = "http://localhost:3001/"; };
            gateway = { endpointPublic = "ws://localhost:3001/"; };
        };
    };
  };

  testScript = ''
    machine.wait_for_unit("spacebarchat-server")
  '';
}
