{lib, ...}: let
  mkVar = key: "\${var.${key}}";
  project = mkVar "project_id";
  region = mkVar "region";
  zone = mkVar "zone";
in {
  terraform.required_providers = {
    google.source = "registry.terraform.io/hashicorp/google";
    google-beta.source = "registry.terraform.io/hashicorp/google-beta";
  };

  provider.google = {
    inherit project region zone;
  };

  provider.google-beta = {
    inherit project region zone;
  };

  resource = {
    google_project_service =
      lib.genAttrs [
        "apigateway"
        "artifactregistry"
        "cloudresourcemanager"
        "cloudtasks"
        "compute"
        "dns"
        "iam"
        "run"
        "secretmanager"
        "servicemanagement"
        "servicecontrol"
      ] (s: {
        inherit project;
        disable_on_destroy = false;
        service = "${s}.googleapis.com";
      });
  };
}
