{ref, ...}: let
  project = ref.vars.project_id;
  location = ref.vars.region;
  tasks = ["connect" "testimonial-request" "sync-portfolio"];

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

    google_cloud_scheduler_job.sync-portfolio-weekly = {
      inherit project;
      region = location;
      name = "${project}-sync-portfolio-weekly";
      schedule = "0 0 * * 1";
      time_zone = "UTC";
      attempt_deadline = "1800s";
      depends_on = ["google_project_service.cloudscheduler"];

      retry_config = {
        retry_count = 5;
        min_backoff_duration = "10s";
        max_backoff_duration = "300s";
        max_doublings = 4;
      };

      http_target = {
        http_method = "POST";
        uri = "\${google_cloud_run_v2_service.srv-internal.uri}/leads/portfolio/schedule-syncs";

        oidc_token = {
          service_account_email = "\${google_service_account.services.email}";
          audience = "\${google_cloud_run_v2_service.srv-internal.uri}";
        };
      };
    };
  };
}
