{lib, ...}: let
  lib' = lib.self;
in
  builtins.mapAttrs (k: _:
    lib'.mkTf {
      _module.args = {
        name = k;
        tag = "latest";
      };

      imports = [../providers.nix ../variables.nix ./service.nix];
    })
  lib'.services
