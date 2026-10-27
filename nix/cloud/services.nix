{
  lib,
  pkgs,
  ref,
  ...
}: let
  lib' = import ../lib.nix {
    inherit lib pkgs;
  };

  project = ref.vars.project_id;
  provider = "google-beta";
  location = ref.vars.region;

  serviceOuts =
    builtins.mapAttrs (name: serviceDir: let
      openapi' = builtins.fromJSON (builtins.readFile (serviceDir + "/openapi.json"));
      uri = "\${google_cloud_run_v2_service.${name}.uri}";
      isMethod = k: builtins.elem k lib'.httpMethods;
      opId = path: k: op: op.operationId or "${name}_${path}_${k}";
    in {
      resource = {
        google_cloud_run_v2_service.${name} = {
          inherit name location;
          deletion_protection = "\${var.secretspec_profile == \"prod\"}";

          template = {
            service_account = "\${google_service_account.runtime.email}";

            scaling = {
              min_instance_count = 0;
              max_instance_count = 2;
            };

            containers = {
              image = "\${var.region}-docker.pkg.dev/\${var.project_id}/\${var.project_id}/${name}:latest";

              env = [
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
                initial_delay_seconds = 5;
                timeout_seconds = 3;
                period_seconds = 10;
                failure_threshold = 5;
                http_get.path = "/health";
              };
            };
          };

          depends_on = [
            "google_project_service.run"
            "google_secret_manager_secret_version.sops_age_key"
            "google_secret_manager_secret_iam_member.sops_age_key_runtime"
          ];
        };

        google_cloud_run_v2_service_iam_member.${name} = {
          inherit project location;
          name = "\${google_cloud_run_v2_service.${name}.name}";
          role = "roles/run.invoker";
          member = "serviceAccount:\${google_service_account.services.email}";
        };
      };

      openapi = {
        paths = lib.mapAttrs' (path: spec:
          lib.nameValuePair (lib.removeSuffix "/" "/${builtins.replaceStrings ["srv-"] [""] name}${path}") (lib.mapAttrs (k: op:
            if isMethod k
            then
              op
              // (let
                operationId = opId path k op;
              in {
                inherit operationId;
                "x-google-backend" = operationId;
              })
            else op)
          spec))
        openapi'.paths;

        backends = lib.concatMapAttrs (path: spec:
          lib.mapAttrs' (method: op:
            lib.nameValuePair (opId path method op) {
              address = "${uri}${path}";
              jwtAudience = uri;
              pathTranslation = "CONSTANT_ADDRESS";
              deadline = 60;
            })
          (lib.filterAttrs (k: _: isMethod k) spec))
        openapi'.paths;

        components-schemas = openapi'.components.schemas or {};
      };
    })
    lib'.services;

  merge = key: lib.foldl' (a: b: a // b) {} (lib.mapAttrsToList (_: s: s.openapi.${key}) serviceOuts);

  openapi = builtins.toJSON {
    openapi = "3.0.3";
    paths = merge "paths";

    info = {
      title = "services";
      version = "1.0.0";
    };

    servers = [
      {
        url = "https://${project}.apigateway.${project}.cloud.goog";
        x-google-endpoint.allowCors = true;
      }
    ];

    components = {
      schemas = merge "components-schemas";
    };

    x-google-api-management.backends = merge "backends";
  };
in {
  locals = {
    inherit openapi;
  };

  resource = lib.foldl' lib.recursiveUpdate {
    google_service_account.services = {
      inherit project;
      account_id = "services";
    };

    google_api_gateway_api.services = {
      inherit project provider;
      api_id = project;
      depends_on = ["google_project_service.apigateway"];
    };

    google_api_gateway_api_config.services = {
      inherit project provider;
      api = "\${google_api_gateway_api.services.api_id}";
      gateway_config.backend_config.google_service_account = "\${google_service_account.services.email}";
      lifecycle.create_before_destroy = true;

      openapi_documents = [
        {
          document = {
            path = "openapi.json";
            contents = "\${base64encode(local.openapi)}";
          };
        }
      ];

      depends_on = [
        "google_project_service.servicemanagement"
        "google_project_service.servicecontrol"
      ];
    };

    google_api_gateway_gateway.services = {
      inherit project provider;
      region = location;
      api_config = "\${google_api_gateway_api_config.services.id}";
      gateway_id = "services";
    };
  } (lib.mapAttrsToList (_: v: v.resource) serviceOuts);
}
