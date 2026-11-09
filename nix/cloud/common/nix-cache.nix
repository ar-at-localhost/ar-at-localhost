{ref, ...}: let
  name = "nix-cache";
  location = ref.vars.region;
in {
  output."${name}-bucket".value = "google_storage_bucket.${name}.url";

  resource = {
    google_storage_bucket.${name} = {
      inherit location;
      name = "\${var.project_id}-${name}";
      uniform_bucket_level_access = true;
      public_access_prevention = "enforced";
      force_destroy = false;
    };

    google_service_account.${name} = {
      account_id = name;
      display_name = name;
    };

    google_storage_bucket_iam_member.${name} = {
      bucket = "\${google_storage_bucket.${name}.name}";
      role = "roles/storage.objectUser";
      member = "serviceAccount:\${google_service_account.${name}.email}";
    };
  };
}
