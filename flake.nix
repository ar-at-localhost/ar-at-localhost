{
  description = "ar-at-localhost";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?rev=48752ce043f693c1b57296b2f27cc392900f33f1";
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
    images = forEachSupportedSystem (
      {pkgs, ...}:
        import ./nix/images.nix {
          inherit pkgs;
          inherit (pkgs) lib;
        }
    );

    packages = forEachSupportedSystem (
      {pkgs, ...}: let
        inherit (pkgs) lib;
      in
        {
          pnpm-deps = pkgs.callPackage ./nix/pnpm-deps.nix {};
          gcloud = pkgs.google-cloud-sdk.withExtraComponents [pkgs.google-cloud-sdk.components.cloud-run-proxy];

          health = pkgs.writeShellScriptBin "aal-health" ''
            echo "OK..."
          '';
        }
        // (import ./nix/pkgs/services.nix {inherit lib pkgs;})
    );
  };
}
