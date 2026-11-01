{ref, ...}: let
  project = ref.vars.project_id;
  location = ref.vars.region;
in {
  resource = {
    google_cloud_tasks_queue.connect = {
      inherit location;
      name = "${project}-connect";

      http_target = {
        http_method = "POST";

        uri_override = {
          host = "\${trimprefix(google_cloud_run_v2_service.srv-internal.uri, \"https://\")}";
        };

        oidc_token = {
          service_account_email = "\${google_service_account.services.email}";
          audience = "\${google_cloud_run_v2_service.srv-internal.uri}";
        };
      };

      retry_config = {
        max_attempts = 5;
        max_backoff = "300s";
        min_backoff = "10s";
        max_doublings = 4;
      };
    };

    google_cloud_tasks_queue_iam_member.services = {
      inherit location;
      name = "\${google_cloud_tasks_queue.connect.name}";
      role = "roles/cloudtasks.enqueuer";
      member = "serviceAccount:\${google_service_account.runtime.email}";
    };
  };
}
