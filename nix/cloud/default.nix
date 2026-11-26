{
  imports = [
    ./imports.nix
    ./providers.nix
    ./secrets.nix
    ./services.nix
    ./storage.nix
    ./variables.nix
  ];

  terraform.backend.gcs = {
    bucket = "\${var.project_id}-tfstate";
    prefix = "tofu/state-base";
  };
}
