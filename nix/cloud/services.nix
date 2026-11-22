{ref, ...}: let
  project = ref.vars.project_id;
in {
  resource = {
    google_service_account.services = {
      inherit project;
      account_id = "services";
    };
  };
}
