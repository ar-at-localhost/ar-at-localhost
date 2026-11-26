{pkgs, ...}: let
  inherit (pkgs.stdenv) system;
  inherit (pkgs) chromium;
in {
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

  packages = [chromium] ++ (with pkgs; [convco jq libxml2 markdownlint-cli2 nodejs opentofu playwright postgresql pnpm secretspec skopeo sops]);

  profiles = {
    cloud.module = {
      enterShell = ''
        export AWS_ACCESS_KEY_ID="$(secretspec get NIX_CACHE_BUCKET_KEY_ID || true)"
        export AWS_SECRET_ACCESS_KEY="$(secretspec get NIX_CACHE_BUCKET_KEY || true)"
        export GCP_KEY="$(secretspec get GCP_KEY || true)"
        export GCP_KEY_FILE="$HOME/.gcp-key"
        export GCP_PROJECT="$(secretspec get TF_VAR_project_name || true)"
        export GCP_REGION="$(secretspec get TF_VAR_region || true)"
        export S3_BUCKET="$(secretspec get NIX_CACHE_BUCKET || true)"
        export S3_ENDPOINT="https://storage.googleapis.com"

        if [[ -n "$GCP_KEY" ]]; then
          export GOOGLE_APPLICATION_CREDENTIALS="$GCP_KEY_FILE"

          if [[ "$(cat $GCP_KEY_FILE 2>/dev/null)" != "$GCP_KEY" ]]; then
            printf "%s" "$GCP_KEY" > "$GCP_KEY_FILE"
            gcloud auth activate-service-account --key-file "$GCP_KEY_FILE" --quiet
          fi
        fi
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
              pnpm turbo --filter "$name" build
              pnpm --filter "$name" firebase deploy --project "$profile" --only hosting:app
            '
          '';

        "aal:deploy-service-image".exec =
          #bash
          ''
            set -euo pipefail
            name=$(echo "$DEVENV_TASK_INPUT" | jq -r '.name // empty')
            profile=$(echo "$DEVENV_TASK_INPUT" | jq -r '.profile // empty')

            if [[ -z "$name" || -z "$profile" ]]; then
              echo "SERVICE / SECRETSPEC_PROFILE env vars are required" >&2
              exit 1
            fi

            export SECRETSPEC_PROFILE="$profile"
            export out="result-$name"
            export target=".#images.${system}.$name"
            export version=$(nix eval --raw "$target.imageTag")
            nix build --fallback "$target" -o "$out"

            # shellcheck disable=SC2016
            secretspec run -- bash -c '
              skopeo copy \
                --digestfile "$out.digest" \
                --dest-creds "_json_key:$GCP_KEY"  \
                "docker-archive:./$out" \
                "docker://$TF_VAR_region-docker.pkg.dev/$TF_VAR_project_name/$TF_VAR_project_name/$name:$version"

              digest=$(cat "$out.digest")
              echo "{ \"digest\": \"$digest\" }" > "$DEVENV_TASK_OUTPUT_FILE"
            '
          '';

        "aal:tf" = {
          exec =
            #bash
            ''
              # dir=$(mktemp -d)
              dir=$(pwd)
              file="$dir/config.tf.json"
              rm -f "$file" >/dev/null 2>&1

              config=$(echo "$DEVENV_TASK_INPUT" | jq -r '.config // empty')
              apply=$(echo "$DEVENV_TASK_INPUT" | jq -r '.apply // empty')
              state=$(echo "$DEVENV_TASK_INPUT" | jq -r '.state // empty')

              if [[ -z "$config" ]]; then
                echo '|  Error: `config` is required!'
                exit 1
              fi

              nix build --out-link "$file" ".#tf.${system}.$config"
              echo "$file"
              secretspec run tofu -chdir="$dir" init -reconfigure
              secretspec run tofu -chdir="$dir" validate

              if [[ -n "$state" ]]; then
                secretspec run tofu -chdir="$dir" refresh -consolidate-errors -concise
                exit 0
              fi

              if [[ -n "$apply" ]]; then
                secretspec run tofu -chdir="$dir" apply -consolidate-errors -concise -auto-approve
              fi
            '';
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
