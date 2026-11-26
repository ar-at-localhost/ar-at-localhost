{
  imports = [
    ../providers.nix
    ../variables.nix
    # ./imports.nix
    ./data.nix
    ./tasks.nix
    ./gateway.nix
  ];

  terraform.backend.gcs = {
    bucket = "\${var.project_id}-tfstate";
    prefix = "tofu/state-gateway";
  };
}
