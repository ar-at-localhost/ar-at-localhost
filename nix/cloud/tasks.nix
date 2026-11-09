{
  lib,
  ref,
  ...
}: let
  project = ref.vars.project_id;
  location = ref.vars.region;
  tasks = ["connect" "testimonial-request"];

  genAttrs = names: f:
    builtins.listToAttrs (builtins.map (n: {
        name = n;
        value = f n;
      })
      names);
in {
  resource = {
    google_cloud_tasks_queue = genAttrs tasks (name: {
      inherit location;
      name = "${project}-${name}";

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
    });

    google_cloud_tasks_queue_iam_member = genAttrs tasks (name: {
      inherit location;
      name = "\${google_cloud_tasks_queue.${name}.name}";
      role = "roles/cloudtasks.enqueuer";
      member = "serviceAccount:\${google_service_account.runtime.email}";
    });
  };
}
