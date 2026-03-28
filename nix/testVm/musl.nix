# https://github.com/MatthewCroughan/nixos-musl/blob/master/musl.nix
{ pkgs, lib, ... }:
let
  glibcPkgs = (import pkgs.path { system = pkgs.stdenv.hostPlatform.system; });
in
{
  # Fails to build, and doesn't make sense on musl anyway
  services.nscd.enableNsncd = false;
  services.nscd.enable = false;
  system.nssModules = lib.mkForce [];

  # wrappers use pkgsStatic which has issues on native musl at this time
  security.enableWrappers = pkgs.stdenv.buildPlatform.isGnu;

  xdg.mime.enable = if (pkgs.stdenv.buildPlatform != pkgs.stdenv.hostPlatform) then false else true;

  # stub-ld doesn't make sense with musl
  environment.stub-ld.enable = false;

  # Fails unless neutered error: expected a set but found null: null
  i18n.glibcLocales = pkgs.runCommand "neutered" { } "mkdir -p $out";

  # Perl stuff just fails too hard these days
  # services.userborn.enable = true;

  nixpkgs.overlays = [
    (self: super: {
      # qemu doesn't build for musl, and if we want to run the
      # config.system.build.vm, we need a glibc qemu, doens't impact anything
      # else
      qemu = glibcPkgs.qemu;

      ## But the qemu_test binary is fine on musl
      qemu_test = glibcPkgs.qemu_test;

      # Tests are so flaky...
      git = super.git.overrideAttrs { doInstallCheck = false; };

      # https://github.com/NixOS/nixpkgs/pull/451147
      diffutils = super.diffutils.overrideAttrs (old: {
        postPatch =
          if (super.stdenv.buildPlatform.isGnu && super.stdenv.hostPlatform.isMusl) then
      ''
        sed -i -E 's:test-getopt-gnu::g' gnulib-tests/Makefile.in
        sed -i -E 's:test-getopt-posix::g' gnulib-tests/Makefile.in
      '' else null;
      });

      # checks fail on musl
      logrotate = super.logrotate.overrideAttrs {
        doCheck = false;
      };
      rsync = super.rsync.overrideAttrs {
        doCheck = false;
      };
      spdlog = super.spdlog.overrideAttrs {
        doCheck = false;
      };
    })
  ];

  # These options sometimes work, and sometimes don't, because of perl
  nix.enable = lib.mkForce false;
  system = {
    tools.nixos-generate-config.enable = lib.mkForce false;
    switch.enable = lib.mkForce false;
    disableInstallerTools = lib.mkForce false;
    tools.nixos-option.enable = lib.mkForce false;
  };
  documentation = {
    enable =  false;
    doc.enable =  false;
    info.enable =  false;
    man.enable =  false;
    nixos.enable =  false;
  };
}