{
  nixpkgs,
  modulesPath,
  pkgs,
  lib,
  ...
}:
{
  imports = [
    #         (modulesPath + "/virtualisation/qemu-vm.nix")
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
    virtualisation.memorySize = 4096;
    virtualisation.cores = 6;
    virtualisation.forwardPorts = [
        # { hostPort = 2222; guestPort = 22; } # Probably shouldn't do this with root:root lol
        { from = "host"; host.port = 8080; guest.port = 80; }
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

  system = {
    #activatable = false;
    copySystemConfiguration = false;
    includeBuildDependencies = false;
    disableInstallerTools = lib.mkForce true;
    build = {
      separateActivationScript = true;
    };
  };
}
