{
  description = "ar-at-localhost";
  inputs.nixpkgs.url = "github:nixos/nixpkgs?rev=8eb9f99282ae9b85dcc5912cd3bb50035b7f4289";

  outputs = inputs: let
    inherit (inputs.nixpkgs) lib;

    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
      "aarch64-darwin"
    ];

    forEachSupportedSystem = f:
      lib.genAttrs supportedSystems (
        system:
          f {
            inherit system;
            pkgs = import inputs.nixpkgs {
              inherit system;
            };
          }
      );
  in {
    packages = forEachSupportedSystem (
      {pkgs, ...}: {
        crypt_shared = pkgs.callPackage ./nix/pkgs/crypt_shared.nix {};
      }
    );
  };
}
