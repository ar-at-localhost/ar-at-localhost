{
  lib,
  ref,
  ...
}: let
  lib' = lib.self;
  project = ref.vars.project_id;
  location = ref.vars.region;
in {
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
