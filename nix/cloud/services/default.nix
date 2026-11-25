{
  inputs,
  lib,
  pkgs,
  system,
  ...
}: let
  inherit (inputs) terranix;
  lib' = import ../../lib.nix {
    inherit lib pkgs;
  };
in
  builtins.mapAttrs (k: _:
    terranix.lib.terranixConfiguration {
      inherit system pkgs;

      modules = [
        {
          _module.args = {
            name = k;
            tag = "latest";
            inherit lib';
          };

          imports = [../providers.nix ../variables.nix ./service.nix];
        }
      ];
    })
  lib'.services
