{ref, ...}: let
  mkVar = key: "\${var.${key}}";
  project = mkVar "project_id";
  project_name = mkVar "project_name";
  region = mkVar "region";
  location = ref.vars.region;
in {
  resource = {
    google_artifact_registry_repository.repo = {
      inherit project;
      depends_on = ["google_project_service.artifactregistry"];
      location = region;
      format = "DOCKER";
      repository_id = project_name;
      cleanup_policy_dry_run = true;

      lifecycle = {
        prevent_destroy = true;
      };

      cleanup_policies = [
        {
          id = "keep-latest";
          action = "KEEP";
          condition = {
            tag_state = "TAGGED";
            tag_prefixes = ["latest"];
          };
        }
        {
          id = "max-3-tags";
          action = "KEEP";

          most_recent_versions = {
            package_name_prefixes = ["srv"];
            keep_count = 3;
          };
        }
        {
          id = "delete-rest";
          action = "DELETE";
          condition = {
            tag_state = "ANY";
          };
        }
      ];
    };

    google_storage_bucket.server = {
      inherit location;
      name = "\${var.project_id}-server";
      uniform_bucket_level_access = true;
      public_access_prevention = "enforced";
      force_destroy = false;
    };

    google_storage_bucket_iam_member.runtime = {
      bucket = "\${google_storage_bucket.server.name}";
      role = "roles/storage.objectUser";
      member = "serviceAccount:\${google_service_account.runtime.email}";
    };
  };

  terraform.backend.gcs = {
    bucket = "\${var.project_id}-tfstate";
    prefix = "tofu/state";
  };
}
