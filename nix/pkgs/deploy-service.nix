{pkgs, ...}: let
  system = pkgs.stdenv.system;
in
  pkgs.writeShellApplication {
    name = "deploy-service";
    runtimeInputs = with pkgs; [google-cloud-sdk nix opentofu secretspec skopeo];
    text = ''
      name="''${1:-}"
      profile="''${2:-default}"

      if [[ -z "$name" ]]; then
        echo "Service name is required" >&2
        exit 1
      fi

      out="result-$name"
      target=".#images.${system}.$name"
      version=$(nix eval --raw "$target.imageTag")
      nix build "$target" -o "$out"

      # shellcheck disable=SC2016
      secretspec run --profile "$profile" -- bash -c '
        set -euo pipefail
        out="$1"; name="$2" version="$3";

        skopeo copy \
          --dest-creds "_json_key:$GOOGLE_CREDENTIALS"  \
          "docker-archive:./$out" \
          "docker://''${TF_VAR_region}-docker.pkg.dev/$TF_VAR_project_name/$TF_VAR_project_name/$name:$version"

        skopeo copy \
          --dest-creds "_json_key:$GOOGLE_CREDENTIALS"  \
          "docker-archive:./$out" \
          "docker://''${TF_VAR_region}-docker.pkg.dev/$TF_VAR_project_name/$TF_VAR_project_name/$name:latest"

        # Ensure resource is created
        tofu apply -auto-approve -target "google_cloud_run_v2_service.$name"

        # Update service
        gcloud run services update \
          --project "''${TF_VAR_project_name}" "$name" \
          --region "''${TF_VAR_region}" \
          --image "''${TF_VAR_region}-docker.pkg.dev/''${TF_VAR_project_name}/''${TF_VAR_project_name}/''${name}:latest"
      ' -- "$out" "$name" "$version"
    '';
  }
