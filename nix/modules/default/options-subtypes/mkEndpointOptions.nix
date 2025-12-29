{ lib }:
defaultHost: defaultPort:
lib.mkOption {
  type = lib.types.submodule {
    options = {
      useSsl = lib.mkEnableOption "Use SSL for this endpoint.";
      host = lib.mkOption {
        type = lib.types.str;
        default = defaultHost;
        description = "Host to bind to.";
      };
      localPort = lib.mkOption {
        type = lib.types.port;
        default = defaultPort;
        description = "Port to bind to.";
      };
      publicPort = lib.mkOption {
        type = lib.types.port;
        default = 443;
        description = "Public port to use in .well-known, defaults to 443.";
      };
    };
  };
  default = { };
}
