{ref, ...}: let
  name = "attic-cache";
  location = ref.vars.region;
  count = ''''${ var.attic == true ? 1 : 0 }'';
in {
  output."${name}-bucket".value = "\${google_storage_bucket.${name}[0].url}";

  resource = {
    google_cloud_run_v2_service."${name}" = {
      inherit name location count;
      deletion_protection = true;

      template = {
        execution_environment = "EXECUTION_ENVIRONMENT_GEN2";
        service_account = "\${google_service_account.${name}[0].email}";
        timeout = "3600s";

        scaling = {
          min_instance_count = 0;
          max_instance_count = 1;
        };

        containers = [
          {
            name = "nginx";
            image = "nginx:stable";

            ports = {
              name = "h2c";
              container_port = 8080;
            };

            command = ["/bin/sh"];

            args = [
              "-c"
              ''
                cat > /etc/nginx/conf.d/default.conf <<'EOF'
                server {
                  listen 0.0.0.0:8080;
                  http2 on;
                  client_max_body_size 0;

                  location / {
                    proxy_pass http://127.0.0.1:8081;
                    proxy_http_version 1.1;
                    proxy_set_header Host $host;
                    proxy_request_buffering off;
                    proxy_buffering off;
                    proxy_read_timeout 3600s;
                    proxy_send_timeout 3600s;
                  }
                }
                EOF

                exec nginx -g 'daemon off;'
              ''
            ];
          }
          {
            name = "attic";
            image = "\${var.region}-docker.pkg.dev/\${var.project_id}/\${var.project_id}/${name}:latest";

            env = [
              {
                name = "PORT";
                value = "8081";
              }
              {
                name = "SECRETSPEC_PROFILE";
                value = ref.vars.secretspec_profile;
              }
              {
                name = "SOPS_AGE_KEY";
                value_source = {
                  secret_key_ref = {
                    secret = "\${google_secret_manager_secret.sops_age_key.secret_id}";
                    version = "latest";
                  };
                };
              }
            ];

            startup_probe = {
              initial_delay_seconds = 10;
              timeout_seconds = 10;
              period_seconds = 10;
              failure_threshold = 10;

              http_get = {
                path = "/";
                port = 8081;
              };
            };
          }
        ];
      };

      depends_on = [
        "google_project_service.run"
        "google_secret_manager_secret_version.sops_age_key"
        "google_secret_manager_secret_iam_member.${name}-sops_age_key"
        "google_storage_bucket.${name}"
        "google_storage_bucket_iam_member.${name}"
      ];
    };

    google_cloud_run_v2_service_iam_member."${name}-public" = {
      inherit count;
      project = "\${google_cloud_run_v2_service.${name}[0].project}";
      location = "\${google_cloud_run_v2_service.${name}[0].location}";
      name = "\${google_cloud_run_v2_service.${name}[0].name}";
      role = "roles/run.invoker";
      member = "allUsers";
    };

    google_storage_bucket.${name} = {
      inherit location count;
      name = "\${var.project_id}-${name}";
      uniform_bucket_level_access = true;
      public_access_prevention = "enforced";
      force_destroy = false;
    };

    google_service_account.${name} = {
      inherit count;
      account_id = name;
      display_name = name;
    };

    google_secret_manager_secret_iam_member."${name}-sops_age_key" = {
      inherit count;
      secret_id = "\${google_secret_manager_secret.sops_age_key.secret_id}";
      role = "roles/secretmanager.secretAccessor";
      member = "serviceAccount:\${google_service_account.${name}[0].email}";
    };

    google_storage_bucket_iam_member.${name} = {
      inherit count;
      bucket = "\${google_storage_bucket.${name}[0].name}";
      role = "roles/storage.objectUser";
      member = "serviceAccount:\${google_service_account.${name}[0].email}";
    };
  };
}
