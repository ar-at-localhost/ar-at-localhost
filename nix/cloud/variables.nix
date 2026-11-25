{lib, ...}: let
  lib' = lib.self;

  variables = {
    attic = {
      type = "bool";
      default = "false";
    };

    domain_name = {
      type = "string";
    };

    jwt = {
      type = "string";
      sensitive = true;
    };

    project_id = {
      type = "string";
    };

    project_name = {
      type = "string";
      default = "ar-at-localhost";
    };

    project_number = {
      type = "string";
    };

    region = {
      type = "string";
      default = "us-central1";
    };

    secretspec_profile = {
      type = "string";
      default = "ci";
    };

    sops_age_key = {
      type = "string";
      sensitive = true;
    };

    zone = {
      type = "string";
      default = "us-central1-c";
    };
  };

  vars = builtins.mapAttrs (k: _: "\${var.${k}}") variables;
  project = vars.project_id;
  location = vars.region;
in {
  variable = variables;

  _module.args = {
    ref = {
      inherit vars;
    };
  };

  data = {
    google_service_account = {
      runtime = {
        inherit project;
        account_id = "runtime";
      };

      services = {
        inherit project;
        account_id = "services";
      };
    };

    google_cloud_run_v2_service =
      builtins.mapAttrs (k: _: {
        inherit project location;
        name = k;
      })
      lib'.services;

    google_secret_manager_secret.sops_age_key = {
      inherit project;
      secret_id = "sops_age_key";
    };

    google_secret_manager_secret_iam_policy.sops_age_key = {
      inherit project;
      secret_id = "\${data.google_secret_manager_secret.sops_age_key.secret_id}";
    };

    google_secret_manager_secret_version.sops_age_key = {
      inherit project;
      secret = "\${data.google_secret_manager_secret.sops_age_key.secret_id}";
      version = "latest";
    };
  };
}
