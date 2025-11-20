self:
{ config, lib, pkgs, ... }:

{
  name = "test-bundle-starts";

  nodes.machine = {
    imports = [ self.nixosModules.default ];

    services.spacebarchat-server.enable = true;
  };

  testScript = ''
    machine.wait_for_unit("spacebarchat-server")
  '';
}
