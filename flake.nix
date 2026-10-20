{
  description = "ar-at-localhost";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?rev=8eb9f99282ae9b85dcc5912cd3bb50035b7f4289";

    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {self, ...} @ inputs: let
    inherit (inputs.nixpkgs) lib;

    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
    ];

    forEachSupportedSystem = f:
      lib.genAttrs supportedSystems (
        system:
          f {
            inherit self system;
            pkgs = import inputs.nixpkgs {
              inherit system;
            };
          }
      );
  in {
    # Run the hooks in a sandbox with `nix flake check`.
    # Read-only filesystem and no internet access.
    checks = forEachSupportedSystem ({system, ...}: {
      pre-commit-check = inputs.git-hooks.lib.${system}.run {
        src = ./.;
        hooks = {
          alejandra.enable = true;
          oxfmt.enable = true;
          oxlint.enable = true;

          quality = {
            enable = true;
            entry = "secretspec run pnpm quality";
            name = "Quality Checks";
            pass_filenames = false;
            stages = ["pre-push"];
          };
        };
      };
    });

    packages = forEachSupportedSystem (
      {pkgs, ...}: {
        crypt_shared = pkgs.callPackage ./nix/pkgs/crypt_shared.nix {};
      }
    );

    devShell = forEachSupportedSystem (
      {
        self,
        pkgs,
        system,
        ...
      }: let
        crypt_shared = pkgs.callPackage ./nix/pkgs/crypt_shared.nix {};
        inherit (pkgs) playwright chromium;
        inherit (self.checks.${system}.pre-commit-check) shellHook enabledPackages;
      in
        pkgs.mkShellNoCC {
          packages = enabledPackages ++ [chromium crypt_shared playwright] ++ (with pkgs; [nodejs pnpm secretspec sops]);
          shellHook =
            shellHook
            + ''
              echo "󰣫 ar-at-localhost"
              export MONGO_CRYPT_LIB="${crypt_shared}/lib/mongo_crypt_v1.so"
              export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1;
              export CHROMIUM_PATH="${chromium}/bin/chromium"
              pnpm install
            '';
        }
    );
  };
}
