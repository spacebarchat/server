{ pkgs, lib, ... }:
{
  #perlless profile
#  system.switch.enable = lib.mkForce false;

  # Remove perl from activation
  #system.etc.overlay.enable = lib.mkForce true;
  #systemd.sysusers.enable = lib.mkForce true;

  # Random perl remnants
  programs.less.lessopen = lib.mkForce null;
  programs.command-not-found.enable = lib.mkForce false;
  environment.defaultPackages = lib.mkForce [ ];
  documentation.info.enable = lib.mkForce false;
  documentation.man.enable = false;

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
