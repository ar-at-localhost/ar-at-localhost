{
  description = "ar-at-localhost";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?rev=48752ce043f693c1b57296b2f27cc392900f33f1";

    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    terranix = {
      url = "github:terranix/terranix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {
    self,
    terranix,
    ...
  } @ inputs: let
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
          actionlint.enable = true;
          alejandra.enable = true;

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
          packages =
            enabledPackages
            ++ [chromium crypt_shared playwright]
            ++ (with pkgs; [doctl google-cloud-sdk nodejs opentofu pnpm secretspec skopeo sops]);
          shellHook =
            shellHook
            + ''
              echo "󰣫 ar-at-localhost"
              export MONGO_CRYPT_LIB="${crypt_shared}/lib/mongo_crypt_v1.so"
              export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1;
              export CHROMIUM_PATH="${chromium}/bin/chromium"
              pnpm install --frozen-lockfile
            '';
        }
    );

    images = forEachSupportedSystem (
      {pkgs, ...}:
        import ./nix/images.nix {
          inherit pkgs;
          inherit (pkgs) lib;
        }
    );

    apps = forEachSupportedSystem (
      {
        pkgs,
        system,
        ...
      }: let
        inherit (pkgs) opentofu;
        terraformConfig = terranix.lib.terranixConfiguration {
          inherit system;
          modules = [./nix/cloud];
        };
      in {
        tofu-view = {
          type = "app";
          program = toString (pkgs.writers.writeBash "tofu-view" ''
            cat ${terraformConfig}
          '');
        };

        tofu-apply = {
          type = "app";
          program = toString (pkgs.writers.writeBash "tofu-apply" ''
            profile="''${1:-default}"
            if [[ -e config.tf.json ]]; then
              rm -f config.tf.json
            fi

            cp ${terraformConfig} config.tf.json \
              && ${opentofu}/bin/tofu init \
              && ${opentofu}/bin/tofu validate \
              && secretspec run --profile "$profile" ${opentofu}/bin/tofu apply \
          '');
        };

        pnpm-hash = let
          pkg = pkgs.callPackage ./nix/pkgs/pnpm-hash.nix {};
        in {
          type = "app";
          program = "${pkg}/bin/pnpm-hash";
        };

        deploy-service = let
          pkg = pkgs.callPackage ./nix/pkgs/deploy-service.nix {};
        in {
          type = "app";
          program = "${pkg}/bin/deploy-service";
        };
      }
    );

    packages = forEachSupportedSystem (
      {pkgs, ...}: let
        inherit (pkgs) lib;
      in
        {
          crypt_shared = pkgs.callPackage ./nix/pkgs/crypt_shared.nix {};
          pnpm-deps = pkgs.callPackage ./nix/pkgs/pnpm-deps.nix {};
        }
        // (import ./nix/pkgs/services.nix {inherit lib pkgs;})
    );
  };
}
