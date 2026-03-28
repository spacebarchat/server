{
  config,
  pkgs,
  lib,
  modulesPath,
  ...
}:
{
  imports = [
    #    (modulesPath + "/virtualisation/qemu-vm.nix")
    ./musl.nix
  ];

  virtualisation.vmVariant = {
    services.xserver.videoDrivers = [ "qxl" ];
    services.spice-vdagentd.enable = true;
    virtualisation.qemu.guestAgent.enable = true;
    services.qemuGuest.enable = true;
    virtualisation.qemu.options = [
      "-vga qxl -device virtio-serial-pci -spice port=5930,disable-ticketing=on -device virtserialport,chardev=spicechannel0,name=com.redhat.spice.0 -chardev spicevmc,id=spicechannel0,name=vdagent"
      "-display gtk,zoom-to-fit=off,show-cursor=on"
      "-device virtio-balloon"
    ];
    virtualisation.memorySize = 8192;
    virtualisation.cores = 10;
    virtualisation.forwardPorts = [
      # { hostPort = 2222; guestPort = 22; } # Probably shouldn't do this with root:root lol
      {
        from = "host";
        host.port = 8080;
        guest.port = 80;
      }
    ];
    networking.useDHCP = lib.mkForce true;
  };

  networking.firewall.enable = false;

  boot = {
    initrd = {
      systemd.enable = true;
      systemd.emergencyAccess = true;
    };
    kernelParams = [
      "console=ttyS0,115200"
      "systemd.gpt_auto=0"
      #"console=tty1"
      #"quiet"
    ];
    loader.timeout = 1;
  };
  boot.supportedFilesystems = lib.mkForce [ ];
  hardware.enableRedistributableFirmware = lib.mkForce false;
  #environment.systemPackages = lib.mkForce [  ];
  documentation.enable = lib.mkForce false;
  documentation.nixos.enable = lib.mkForce false;
  networking.wireless.enable = lib.mkForce false;

  console = {
    earlySetup = true;
    font = "${pkgs.cozette}/share/consolefonts/cozette6x13.psfu";
    packages = with pkgs; [ cozette ];
  };

  # Remove perl from activation
  system.etc.overlay.enable = lib.mkForce true;
  systemd.sysusers.enable = lib.mkForce true;

  programs.less.lessopen = lib.mkForce null;
  programs.command-not-found.enable = lib.mkForce false;
  environment.defaultPackages = lib.mkForce [ ];
  documentation.info.enable = lib.mkForce false;
  documentation.man.enable = false;

  system = {
    copySystemConfiguration = false;
    includeBuildDependencies = false;
    disableInstallerTools = lib.mkForce true;
    build = {
      separateActivationScript = true;
    };
    switch.enable = lib.mkForce false;
    nixos-init.enable = true;
  };

    nixpkgs.hostPlatform = {
      system = "x86_64-linux";
      config = "x86_64-unknown-linux-musl";
    };

  boot.loader.grub.enable = lib.mkDefault false;
  fileSystems."/".device = lib.mkDefault "/dev/disk/by-label/nixos";
  # https://github.com/NixOS/nixpkgs/pull/496852/changes
  boot.postBootCommands = lib.mkForce "";
  systemd.services.register-nix-paths = lib.mkIf config.nix.enable {
    # Run early during boot so the nix store DB is populated before any
    # service (or test backdoor) tries to use nix commands.
    # nix-store --load-db writes to the SQLite DB directly, so it does not
    # need the nix-daemon.
    unitConfig.DefaultDependencies = false;
    wantedBy = [
      "sysinit.target"
    ];
    before = [
      "sysinit.target"
      "shutdown.target"
      "nix-daemon.socket"
      "nix-daemon.service"
    ];
    after = [
      "local-fs.target"
    ];
    conflicts = [
      "shutdown.target"
    ];
    restartIfChanged = false;
    serviceConfig = {
      Type = "oneshot";
      RemainAfterExit = true;
    };
    script = ''
      if [[ "$(cat /proc/cmdline)" =~ regInfo=([^ ]*) ]]; then
        ${lib.getExe' config.nix.package.out "nix-store"} --load-db < "''${BASH_REMATCH[1]}"
      fi
    '';
  };
}
