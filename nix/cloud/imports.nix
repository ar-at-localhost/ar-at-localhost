{
  import = [
    {
      to = "google_api_gateway_api_config.services";
      id = "projects/\${var.project_id}/locations/global/apis/\${var.project_id}/configs/terraform-20261026114249875800000001";
    }
    {
      to = "google_api_gateway_gateway.services";
      id = "projects/\${var.project_id}/locations/\${var.region}/gateways/services";
    }
    {
      to = "google_artifact_registry_repository.repo";
      id = "projects/\${var.project_id}/locations/\${var.region}/repositories/\${var.project_id}";
    }
    {
      to = "google_cloud_run_v2_service.srv-contact";
      id = "projects/\${var.project_id}/locations/\${var.region}/services/srv-contact";
    }
    {
      to = "google_cloud_run_v2_service_iam_member.srv-contact";
      id = "projects/\${var.project_id}/locations/\${var.region}/services/srv-contact roles/run.invoker serviceAccount:services@\${var.project_id}.iam.gserviceaccount.com";
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
