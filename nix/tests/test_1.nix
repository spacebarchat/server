self:
{ config, lib, pkgs, ... }:

{
  name = "example-test";

  nodes.machine = {
    imports = [ self.nixosModules.default ];

    services.spacebarchat-server.enable = true;
  };

  testScript = ''
    machine.wait_for_unit("spacebarchat-server")
  '';
}
