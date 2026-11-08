{
  pkgs,
  inputs,
  ...
}: let
  inherit (inputs) terranix;
  inherit (pkgs.stdenv) system;
  inherit (pkgs) chromium;
in {
  devcontainer.enable = true;

  languages = {
    javascript = {
      enable = true;
      pnpm = {
        enable = true;
        install.enable = true;
      };
    };
  };

  env = {
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 1;
    CHROMIUM_PATH = "${chromium}/bin/chromium";
  };

  enterShell = ''
    echo "󰣫 ar-at-localhost"
  '';

  enterTest = ''
    secretspec run pnpm quality
  '';

  git-hooks.hooks = {
    actionlint.enable = true;
    alejandra.enable = true;

    quality = {
      enable = true;
      entry = "secretspec run pnpm quality";
      name = "Quality Checks";
      pass_filenames = false;
      stages = ["pre-push"];
    };
  };

  packages = [chromium] ++ (with pkgs; [convco jq libxml2 nodejs opentofu playwright postgresql pnpm secretspec skopeo sops]);

  profiles = {
    cloud.module = {
      enterShell = ''
        export AWS_ACCESS_KEY_ID="$(secretspec get ATTIC_BUCKET_KEY_ID)"
        export AWS_SECRET_ACCESS_KEY="$(secretspec get ATTIC_BUCKET_KEY)"
        export S3_BUCKET="$(secretspec get ATTIC_BUCKET)"
        export S3_ENDPOINT="https://storage.googleapis.com"
      '';

      packages = with pkgs; [(google-cloud-sdk.withExtraComponents [pkgs.google-cloud-sdk.components.cloud-run-proxy]) opentofu skopeo];

      tasks = {
        "aal:deploy-app".exec =
          #bash
          ''
            set -euo pipefail
            export name="$APP"
            export profile="''${SECRETSPEC_PROFILE}"

            if [[ -z "$name" || -z "$profile" ]]; then
              echo "APP / SECRETSPEC_PROFILE env vars are required" >&2
              exit 1
            fi

            secretspec run -- bash -euo pipefail -c '
              secretspec run pnpm turbo --filter "$name" build
              secretspec run pnpm --filter "$name" firebase --project "$profile" deploy
            '
          '';

        "aal:deploy-service".exec =
          #bash
          ''
            set -euo pipefail
            export name="$SERVICE"
            export profile="$SECRETSPEC_PROFILE"

            if [[ -z "$name" || -z "$profile" ]]; then
              echo "SERVICE / SECRETSPEC_PROFILE env vars are required" >&2
              exit 1
            fi

            export out="result-$name"
            export target=".#images.${system}.$name"
            export version=$(nix eval --raw "$target.imageTag")
            nix build --fallback "$target" -o "$out"

            # shellcheck disable=SC2016
            secretspec run -- bash -c '
              skopeo copy \
                --dest-creds "_json_key:$GCP_KEY"  \
                "docker-archive:./$out" \
                "docker://$TF_VAR_region-docker.pkg.dev/$TF_VAR_project_name/$TF_VAR_project_name/$name:$version"

              skopeo copy \
                --dest-creds "_json_key:''${GCP_KEY}"  \
                "docker-archive:./$out" \
                "docker://$TF_VAR_region-docker.pkg.dev/$TF_VAR_project_name/$TF_VAR_project_name/$name:latest"

              # Ensure resource is created
              tofu apply -auto-approve -target "google_cloud_run_v2_service.$name"

              # Update service
              gcloud run services update \
                --project "$TF_VAR_project_name" "$name" \
                --region "$TF_VAR_region" \
                --image "$TF_VAR_region-docker.pkg.dev/''${TF_VAR_project_name}/''${TF_VAR_project_name}/''${name}:latest"
            '
          '';

        "aal:init-cloud" = {
          exec =
            #bash
            ''
              secretspec run tofu init
              secretspec run tofu validate
            '';

          before = ["aal:deploy-service" "aal:sync-cloud"];
        };

        "aal:migrate-database" = {
          before = ["aal:sync-cloud" "aal:deploy-service"];
          exec =
            #bash
            ''
              set -euo pipefail
              secretspec run pnpm --filter lib-server drizzle-kit migrate
            '';
        };

        "aal:sync-cloud" = {
          exec =
            #bash
            ''
              secretspec run tofu apply -consolidate-errors -concise -auto-approve
            '';
        };

        "aal:sync-cloud-dns" = {
          exec =
            #bash
            ''
              secretspec run tofu apply -consolidate-errors -concise -auto-approve -target "google_dns_managed_zone.main"
            '';
        };

        "aal:sync-tofu" = let
          terraformConfig = terranix.lib.terranixConfiguration {
            inherit system;
            modules = [./nix/cloud];
          };
        in {
          exec =
            #bash
            ''
              profile="$SECRETSPEC_PROFILE"
              if [[ -z "$SECRETSPEC_PROFILE" ]]; then
                echo "Profile is not set!"
                exit 1
              fi

              if [[ -e config.tf.json ]]; then
                rm -f config.tf.json
              fi

              cp ${terraformConfig} config.tf.json
            '';

          before = ["aal:init-cloud"];
        };
      };
    };

    e2e.module = {
      extends = ["services"];
      packages = with pkgs; [chromium playwright];

      env = {
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = 1;
        CHROMIUM_PATH = "${chromium}/bin/chromium";
      };
    };

    services.module = {
      packages = with pkgs; [pgadmin4];

      services = {
        postgres = {
          enable = true;
          listen_addresses = "127.0.0.1";
          port = 5432;
          initialDatabases = [
            {
              name = "ar-at-localhost";
            }
          ];
        };
      };
    };
  };

  tasks = {
    "aal:test".exec =
      #bash
      ''
        # shellcheck disable=SC2016
        secretspec run -- bash -euo pipefail -c '
          CI="''${CI:-}"

          if [[ "$CI" == "true" ]]; then
            cleanup() {
              pnpm --filter lib-server exec neon branches delete --project-id "$NEON_PROJECT_ID" "$DB_NAME"
            }

            trap cleanup EXIT

            DB_URI="$(
              pnpm --filter lib-server exec neon branches create --project-id "$NEON_PROJECT_ID" --name "$DB_NAME" --parent "$NEON_BASE" \
              | grep "^postgresql://" \
              | head -n 1
            )"

            export DB_URI
          fi

          pnpm --filter lib-server db:migrate
          pnpm --filter lib-server db:seed
          pnpm quality
        '
      '';
  };
}
