{
  import = [
    {
      to = "google_storage_bucket.server";
      id = "\${var.project_id}-server";
    }
    {
      to = "google_artifact_registry_repository.repo";
      id = "projects/\${var.project_id}/locations/\${var.region}/repositories/\${var.project_id}";
    }
    {
      to = "google_secret_manager_secret.jwt";
      id = "projects/\${var.project_id}/secrets/jwt";
    }
    {
      to = "google_secret_manager_secret.sops_age_key";
      id = "projects/\${var.project_id}/secrets/sops_age_key";
    }
    {
      to = "google_service_account.services";
      id = "projects/\${var.project_id}/serviceAccounts/services@\${var.project_id}.iam.gserviceaccount.com";
    }
    {
      to = "google_service_account.runtime";
      id = "projects/\${var.project_id}/serviceAccounts/runtime@\${var.project_id}.iam.gserviceaccount.com";
    }
    {
      to = "google_secret_manager_secret_iam_member.sops_age_key_runtime";
      id = "projects/\${var.project_id}/secrets/sops_age_key roles/secretmanager.secretAccessor serviceAccount:runtime@\${var.project_id}.iam.gserviceaccount.com";
    }
  ];
}
