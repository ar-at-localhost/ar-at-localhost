{ref, ...}: let
  project = ref.vars.project_id;
in {
  resource = {
    google_service_account.services = {
      inherit project;
      account_id = "services";
    };

    google_service_account.runtime = {
      inherit project;
      account_id = "runtime";
      display_name = "Cloud Run runtime identity";
    };

    google_service_account_iam_member.runtime_acts_as_services = {
      service_account_id = "\${google_service_account.services.name}";
      role = "roles/iam.serviceAccountUser";
      member = "serviceAccount:\${google_service_account.runtime.email}";
    };
  };
}
