{ self, nixpkgs }:

nixpkgs.lib.nixosSystem {
    system = "x86_64-linux";
    modules = [
        self.nixosModules.default
        ./configuration.nix
        ./postgres.nix
        ./vm.nix
    ];
    specialArgs = { inherit self nixpkgs; };
}

#DERIVATION=".#nixosConfigurations.${CONFIG}.config.system.build.toplevel"