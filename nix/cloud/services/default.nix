{lib, ...}: let
  lib' = lib.self;
in
  builtins.mapAttrs (k: _:
    lib'.mkTf {
      _module.args = {
        name = k;
        tag = "latest";
      };

      terraform.backend.gcs = {
        bucket = "\${var.project_id}-tfstate";
        prefix = "tofu/state-${k}";
      };

      imports = [../providers.nix ../variables.nix ./data.nix ./service.nix];
    })
  lib'.services
