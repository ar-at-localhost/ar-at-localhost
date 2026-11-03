{ref, ...}: let
  name = "attic-cache";
  location = ref.vars.region;
  count = ''''${ var.attic == true ? 1 : 0 }'';
in {
  output."${name}-bucket".value = "\${var.attic == true ? google_storage_bucket.${name}[0].url : null}";

  resource = {
    google_cloud_run_v2_service."${name}" = {
      inherit name location count;
      deletion_protection = true;

      template = let
        path = "/nix-store";
      in {
        execution_environment = "EXECUTION_ENVIRONMENT_GEN2";
        service_account = "\${google_service_account.${name}[0].email}";
        timeout = "3600s";

        scaling = {
          min_instance_count = 0;
          max_instance_count = 1;
        };

        volumes = {
          inherit name;

          gcs = {
            bucket = "\${google_storage_bucket.${name}[0].name}";
            read_only = true;
            mount_options = ["implicit-dirs"];
          };
        };

        containers = [
          {
            name = "nginx";
            image = "nginx:stable";
            ports.container_port = 8080;
            command = ["/bin/sh"];

            volume_mounts = {
              name = "${name}";
              mount_path = path;
            };

            args = [
              "-c"
              ''
                cat > /etc/nginx/conf.d/default.conf <<'EOF'
                server {
                  listen 0.0.0.0:8080;
                  http2 on;
                  server_name _;
                  root ${path};
                }
                EOF

                exec nginx -g 'daemon off;'
              ''
            ];

            startup_probe = {
              initial_delay_seconds = 10;
              timeout_seconds = 10;
              period_seconds = 10;
              failure_threshold = 10;
              http_get.path = "/nix-cache-info";
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
