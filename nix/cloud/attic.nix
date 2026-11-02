{ref, ...}: let
  name = "attic-cache";
  location = ref.vars.region;
  count = ''''${ var.attic == true ? 1 : 0 }'';
in {
  output."${name}-bucket".value = "\${var.attic == true ? google_storage_bucket.${name}[0].url : null}";

  resource = {
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
