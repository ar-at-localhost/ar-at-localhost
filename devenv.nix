{
  pkgs,
  inputs,
  ...
}: let
  inherit (inputs) terranix;
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
    pnpm quality
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

  packages = [chromium] ++ (with pkgs; [doctl google-cloud-sdk jq nodejs opentofu playwright postgresql pnpm secretspec skopeo sops]);

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

  tasks = {
    "aal:deploy-app".exec =
      #bash
      ''
        set -euo pipefail
        name="$APP"
        profile="$SECRETSPEC_PROFILE"

        if [[ -z "$name" || -z "$profile" ]]; then
          echo "APP / SECRETSPEC_PROFILE env vars are required" >&2
          exit 1
        fi

        secretspec run pnpm turbo --filter "$name" build
        secretspec run pnpm --filter "$name" firebase --project "$profile" deploy
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
        nix build "$target" -o "$out"

        # shellcheck disable=SC2016
        secretpec run -- bash -c '
          set -euo pipefail

          skopeo copy \
            --dest-creds "_json_key:$GOOGLE_CREDENTIALS"  \
            "docker-archive:./$out" \
            "docker://$TF_VAR_region-docker.pkg.dev/$TF_VAR_project_name/$TF_VAR_project_name/$name:$version"

          skopeo copy \
            --dest-creds "_json_key:''${GOOGLE_CREDENTIALS}"  \
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

    "aal:pnpm-hash".exec = let
      pnpm-hash-fetch = pkgs.callPackage ./nix/pkgs/pnpm-hash.nix {};
    in
      #bash
      ''
        set -euo pipefail
        hash_path="nix/hash.txt"
        specified_hash="$(cat "$hash_path")"
        got_hash=$("${pnpm-hash-fetch}/bin/pnpm-hash")

        if [[ -n "$got_hash" && "$specified_hash" != "$got_hash" ]]; then
          echo "$got_hash" > "$hash_path"

          if [[ "$CI" == "true" ]]; then
            git add "$hash_path"
            git config user.name "$AUTHOR_NAME"
            git config user.email "$AUTHOR_EMAIL"
            git commit -m "fix(nix): update pnpm hash"
            git push --no-verify origin HEAD
            echo "pnpm Hash has been updated. Please pull to integrate first."
            exit 1
          fi
        fi
      '';

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

    "aal:init-cloud" = {
      exec =
        #bash
        ''
          secretspec run tofu init
          secretspec run tofu validate
        '';

      before = ["aal:deploy-service" "aal:sync-cloud"];
    };

    "aal:sync-cloud".exec =
      #bash
      ''
        set -euo pipefail
        secretspec run tofu apply -auto-approve
      '';
  };
}
