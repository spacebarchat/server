{
  config,
  lib,
  pkgs,
  ...
}:

let
  secrets = import ../secrets.nix { inherit lib config; };
  cfg = config.services.spacebarchat-server;
  jsonFormat = pkgs.formats.json { };
in
{
  options.services.spacebarchat-server.cs = lib.mkOption {
    default = { };
    description = "Configuration for C# cdn.";
    type = lib.types.submodule {
      options = {
        defaultAppsettings = lib.mkOption {
          type = jsonFormat.type;
          default = import ./default-appsettings-json.nix;
          description = "Extra appsettings.json configuration for all C#-based services.";
        };
      };
    };
  };

  config = {
    services.spacebarchat-server.cs.defaultAppsettings = import ./default-appsettings-json.nix;
  };
}
