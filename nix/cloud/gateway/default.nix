{
  inputs,
  pkgs,
  system,
  ...
}: let
  inherit (inputs) terranix;
in
  terranix.lib.terranixConfiguration {
    inherit system pkgs;

    modules = [
      {
        imports = [
          ../providers.nix
          ../variables.nix
          ./gateway.nix
        ];
      }
    ];
  }
