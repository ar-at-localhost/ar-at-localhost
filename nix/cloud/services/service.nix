{
  ref,
  name,
  tag,
  ...
}: let
  project = ref.vars.project_id;
  location = ref.vars.region;
in {
  output = {
    service-url.value = "\${google_cloud_run_v2_service.${name}.uri}";
  };

  resource = {
    google_cloud_run_v2_service.${name} = {
      inherit name location;
      deletion_protection = "\${var.secretspec_profile == \"prod\"}";

      template = {
        service_account = "\${data.google_service_account.runtime.email}";

        scaling = {
          min_instance_count = 0;
          max_instance_count = 2;
        };

        containers = {
          image = "\${var.region}-docker.pkg.dev/\${var.project_id}/\${var.project_id}/${name}:${tag}";

          env = [
            {
              name = "SRV_INT_URL";
              value = "https://srv-internal-\${var.project_number}.${location}.run.app";
            }
            {
              name = "SECRETSPEC_PROFILE";
              value = ref.vars.secretspec_profile;
            }
            {
              name = "SOPS_AGE_KEY";
              value_source = {
                secret_key_ref = {
                  secret = "\${data.google_secret_manager_secret.sops_age_key.secret_id}";
                  version = tag;
                };
              };
            }
          ];

          startup_probe = {
            initial_delay_seconds = 10;
            timeout_seconds = 10;
            period_seconds = 10;
            failure_threshold = 10;
            http_get.path = "/health";
          };
        };
      };

      depends_on = [
        "data.google_secret_manager_secret_iam_policy.sops_age_key"
        "data.google_secret_manager_secret_version.sops_age_key"
      ];
    };

    google_cloud_run_v2_service_iam_member.${name} = {
      inherit project location;
      name = "\${google_cloud_run_v2_service.${name}.name}";
      role = "roles/run.invoker";
      member = "serviceAccount:\${data.google_service_account.services.email}";
    };
  };
}
