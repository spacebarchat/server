{
  self,
  nixpkgs,
  flake-utils,
}:
let
  rVersion =
    let
      rev = self.sourceInfo.shortRev or self.sourceInfo.dirtyShortRev;
      date = builtins.substring 0 8 self.sourceInfo.lastModifiedDate;
      time = builtins.substring 8 6 self.sourceInfo.lastModifiedDate;
    in
    "preview.${date}-${time}"; # +${rev}";
in
flake-utils.lib.eachSystem flake-utils.lib.allSystems (
  system:
  let
    pkgs = import nixpkgs {
      inherit system;
    };
    lib = pkgs.lib;
    buildSpacebarDotnetModule = import ../../../nix/lib/buildSpacebarDotnetModule.nix { inherit pkgs rVersion; };
  in
  {
    packages =
      let
        proj = self.packages.${system};
        sysArch = (lib.systems.elaborate system).linuxArch;
        cdnCsWorkerArch =
          if sysArch == "x86_64" then
            "x86_64"
          else if sysArch == "aarch64" then
            "aarch64"
          else
            "AnyCPU";
        makeWorkerPackage =
          arch: variant:
          buildSpacebarDotnetModule {
            name = "Spacebar.Cdn.Worker-${variant}.${arch}";
            nugetDeps = ./deps.${variant}.${arch}.json;
            projectFile = "Spacebar.Cdn.Worker.${variant}.${arch}.csproj";
            srcRoot = ./.;
            packNupkg = false;
            projectReferences = [
              proj.Spacebar-Interop-Cdn-Abstractions
            ];
          }
          // {
            __extraProjectPrefix = "Spacebar.Cdn.Worker";
          };
      in
      {
        Spacebar-Cdn-Worker-x86_64-Q16-HDRI = makeWorkerPackage "x86_64" "Q16-HDRI";
        Spacebar-Cdn-Worker-x86_64-Q16 = makeWorkerPackage "x86_64" "Q16";
        Spacebar-Cdn-Worker-x86_64-Q8 = makeWorkerPackage "x86_64" "Q8";

        Spacebar-Cdn-Worker-aarch64-Q16-HDRI = makeWorkerPackage "aarch64" "Q16-HDRI";
        Spacebar-Cdn-Worker-aarch64-Q16 = makeWorkerPackage "aarch64" "Q16";
        Spacebar-Cdn-Worker-aarch64-Q8 = makeWorkerPackage "aarch64" "Q8";

        Spacebar-Cdn-Worker-AnyCPU-Q16-HDRI = makeWorkerPackage "AnyCPU" "Q16-HDRI";
        Spacebar-Cdn-Worker-AnyCPU-Q16 = makeWorkerPackage "AnyCPU" "Q16";
        Spacebar-Cdn-Worker-AnyCPU-Q8 = makeWorkerPackage "AnyCPU" "Q8";
      };

    containers.docker =
      let
        makeContainer =
          variant:
          (pkgs.dockerTools.buildLayeredImage {
            name = "spacebar-server-cdn-cs-worker-${lib.toLower variant}";
            tag = builtins.replaceStrings [ "+" ] [ "_" ] self.packages.${system}."Spacebar-Cdn-Worker-${variant}".version;
            contents = [ self.packages.${system}."Spacebar-Cdn-Worker-${variant}" ];
            config = {
              Cmd = [ "${self.packages.${system}."Spacebar-Cdn-Worker-${variant}"}/bin/Spacebar.Cdn.Worker" ];
              Expose = [ "5000" ];
            };
          });
      in
      {
        Spacebar-Cdn-Worker-Q16-HDRI = makeContainer "Q16-HDRI";
        Spacebar-Cdn-Worker-Q16 = makeContainer "Q16";
        Spacebar-Cdn-Worker-Q8 = makeContainer "Q8";
      };
  }
)
#// {
#  #      nixosModules.default = import ./nix/modules/default self;
#  checks =
#    let
#      pkgs = import nixpkgs { system = "x86_64-linux"; };
#    in
#    pkgs.lib.recursiveUpdate (pkgs.lib.attrsets.unionOfDisjoint { } self.packages) {
#      x86_64-linux = {
#        # spacebar-server-tests = self.packages.x86_64-linux.default.passthru.tests;
#        docker-admin-api = self.containers.x86_64-linux.docker.admin-api;
#        docker-offload = self.containers.x86_64-linux.docker.offload;
#        docker-cdn-cs = self.containers.x86_64-linux.docker.cdn-cs;
#      };
#    };
#}
