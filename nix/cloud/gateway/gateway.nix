{
  lib,
  ref,
  ...
}: let
  lib' = lib.self;

  project = ref.vars.project_id;
  provider = "google-beta";
  location = ref.vars.region;

  serviceOuts =
    builtins.mapAttrs (name: serviceDir: let
      openapi' = builtins.fromJSON (builtins.readFile (serviceDir + "/openapi.json"));
      uri = "\${data.google_cloud_run_v2_service.${name}.uri}";
      isMethod = k: builtins.elem k lib'.httpMethods;
      opId = path: k: op: op.operationId or "${name}_${path}_${k}";
    in {
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

    components = {
      schemas = merge "components-schemas";
    };

    servers = [
      {
        url = "https://services-dju3p6cr.uc.gateway.dev";
        x-google-endpoint = {
          allowCors = true;
        };
      }
    ];

    x-google-api-management.backends = merge "backends";
  };
in {
  locals = {
    inherit openapi;
  };

  output = {
    api-gateway-url.value = "\${google_api_gateway_gateway.services.default_hostname}";
  };

  resource = {
    google_api_gateway_api.services = {
      inherit project provider;
      api_id = "\${var.project_id}";
      depends_on = ["google_project_service.apigateway"];
    };

    google_api_gateway_api_config.services = {
      inherit project provider;
      api = "\${google_api_gateway_api.services.api_id}";
      gateway_config.backend_config.google_service_account = "\${data.google_service_account.services.email}";
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
  };
}
