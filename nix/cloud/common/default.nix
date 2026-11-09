{
  imports = [
    ../providers.nix
    ../variables.nix
    ./dns.nix
    ./nix-cache.nix
  ];

  terraform.backend.gcs = {
    bucket = "\${var.project_id}-tfstate-common";
    prefix = "tofu/state";
  };
}
