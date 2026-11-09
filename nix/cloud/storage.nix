_: let
  mkVar = key: "\${var.${key}}";
  project = mkVar "project_id";
  project_name = mkVar "project_name";
  region = mkVar "region";
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
  };

  terraform.backend.gcs = {
    bucket = "\${var.project_id}-tfstate";
    prefix = "tofu/state";
  };
}
