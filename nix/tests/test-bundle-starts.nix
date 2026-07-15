{
  self,
  withIpc ? "unix",
}:
{
  config,
  lib,
  pkgs,
  ...
}:

let
  sb = import ../lib/mkEndpoint.nix;
  isRabbitMqTest = lib.strings.hasPrefix "rabbitmq" withIpc;

  testBin = lib.getExe self.outputs.packages.${pkgs.stdenv.system}.Spacebar-Tests;
  testConfigPath = pkgs.writeText "Spacebar-Tests-appsettings.json" (
    builtins.toJSON {
      Configuration = {
        TestInstance = "http://localhost:3001";
        RegisterConcurrentCount = 150;
        OfflineMode = true;
      };
    }
  );
in
{
  name = "test-bundle-starts" + lib.optionalString (withIpc != "unix") ("_ipc=" + withIpc);
  skipTypeCheck = true;
  skipLint = true;
  globalTimeout = 300; # 120

  nodes.machine = {
    imports = [ self.nixosModules.default ];

    virtualisation.cores = 4;

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
            LOG_API_ERRORS = true;
            CDN_SIGNATURE_PATH = "${pkgs.writeText "cdnSig" "meow"}";
            REQUEST_SIGNATURE_PATH = "${pkgs.writeText "reqSig" "meow"}";
          };
          ipcMethod = withIpc;

          settings = {
            limits = {
              rate.enabled = false;
              absoluteRate = {
                register.enabled = false;
                sendMessage.enabled = false;
              };
            };

            rabbitmq.host = lib.mkIf isRabbitMqTest "amqp://guest:guest@127.0.0.1:5672";
            security.cdnSignatureIncludeUserAgent = false;
          };

          nginx.enable = true;
        };
      in
      lib.trace ("Testing with config: " + builtins.toJSON cfg) cfg;
    services.nginx.enable = true;
    services.rabbitmq.enable = isRabbitMqTest;

    # ...fix startup ordering
    systemd.services =
      let
        services = [ "postgresql.service" ] ++ lib.optional (isRabbitMqTest) "rabbitmq.service";
        serviceDef = {
          after = services;
          wants = services;
        };
      in
      {
        "spacebar-api" = serviceDef;
        "spacebar-cdn" = serviceDef;
        "spacebar-gateway" = serviceDef;
        "spacebar-webrtc" = serviceDef;

        "spacebar-tests" = {
          documentation = [ "https://docs.spacebar.chat/" ];
          wantedBy = [ "multi-user.target" ];
          wants = [ "network-online.target" ];
          after = [
            "network-online.target"
            "spacebar-api.service"
            "spacebar-cdn.service"
            "spacebar-gateway.service"
          ];
          requires = [
            "spacebar-api.service"
            "spacebar-cdn.service"
            "spacebar-gateway.service"
          ];
          environment = {
            TEST_APPSETTINGS_PATH = testConfigPath;
          };
          serviceConfig = {
            ExecStart = "${testBin} -reporter verbose -parallelAlgorithm aggressive -maxThreads unlimited -preEnumerateTheories";
            DynamicUser = true;
            Restart = "no";
          };
        };
      };

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

  # https://nixos.org/manual/nixos/stable/index.html#sec-nixos-tests
  # https://nixos.org/manual/nixpkgs/unstable/#tester-runNixOSTest
  testScript = ''
    machine.wait_for_unit("spacebar-api")
    machine.wait_for_unit("spacebar-cdn")
    machine.wait_for_unit("spacebar-gateway")
    # Wait for unit doesn't mean the service is actually ready to accept connections
    machine.wait_for_open_port(80)
    machine.wait_for_open_port(3001)
    machine.wait_for_open_port(3002)
    machine.wait_for_open_port(3003)

    # this should be working
    machine.succeed("curl -f http://api.sb.localhost/.well-known/spacebar/client")

    # check if metrics endpoint works on all services
    machine.succeed("curl -f http://api.sb.localhost/metrics")
    machine.succeed("curl -f http://gateway.sb.localhost/metrics")
    machine.succeed("curl -f http://cdn.sb.localhost/metrics")

    machine.wait_for_unit("spacebar-tests")
    machine.wait_until_fails("systemctl show spacebar-tests.service | grep 'SubState=running' -q") # ... wait for the unit to exit in any way

    testUnitState = machine.get_unit_property("spacebar-tests.service", "SubState"); 
    t.assertNotEqual("failed", testUnitState)
  '';
}
