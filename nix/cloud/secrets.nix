{
  lib,
  ref,
  ...
}: let
  project = ref.vars.project_id;
  commonSecrets = ["sops_age_key" "jwt"];
in {
  resource =
    {
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
    }
    // lib.foldl' lib.recursiveUpdate {} (builtins.map (name: (lib.recursiveUpdate {
        google_secret_manager_secret.${name} = {
          inherit project;
          secret_id = name;
          replication.auto = {};
          depends_on = ["google_project_service.secretmanager"];
        };

        google_secret_manager_secret_version.${name} = {
          secret = "\${google_secret_manager_secret.${name}.id}";
          secret_data = ref.vars.${name};
        };

        google_secret_manager_secret_iam_member."${name}_runtime" = {
          inherit project;
          secret_id = "\${google_secret_manager_secret.${name}.secret_id}";
          role = "roles/secretmanager.secretAccessor";
          member = "serviceAccount:\${google_service_account.runtime.email}";
        };
      }
      (lib.optionalAttrs (name == "jwt") {
        google_secret_manager_secret_iam_member."${name}_runtime_viewer" = {
          inherit project;
          secret_id = "\${google_secret_manager_secret.${name}.secret_id}";
          role = "roles/secretmanager.viewer";
          member = "serviceAccount:\${google_service_account.runtime.email}";
        };
      })))
    commonSecrets);
}
