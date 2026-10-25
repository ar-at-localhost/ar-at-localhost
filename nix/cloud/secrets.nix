{ref, ...}: let
  project = ref.vars.project_id;
in {
  resource = {
    google_secret_manager_secret.sops_age_key = {
      inherit project;
      secret_id = "sops_age_key";
      replication.auto = {};
      depends_on = ["google_project_service.secretmanager"];
    };

    google_secret_manager_secret_version.sops_age_key = {
      secret = "\${google_secret_manager_secret.sops_age_key.id}";
      secret_data = ref.vars.sops_age_key;
    };

    google_service_account.runtime = {
      inherit project;
      account_id = "runtime";
      display_name = "Cloud Run runtime identity";
    };

    google_secret_manager_secret_iam_member.sops_age_key_runtime = {
      inherit project;
      secret_id = "\${google_secret_manager_secret.sops_age_key.secret_id}";
      role = "roles/secretmanager.secretAccessor";
      member = "serviceAccount:\${google_service_account.runtime.email}";
    };
  };

  output.SOPS_AGE_KEY = {
    value = "\${google_secret_manager_secret_version.sops_age_key.secret_data}";
    sensitive = true;
  };
}
