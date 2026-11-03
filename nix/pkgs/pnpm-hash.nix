{pkgs, ...}:
pkgs.writeShellApplication {
  name = "pnpm-hash";
  runtimeInputs = with pkgs; [nix gnused coreutils];

  text = ''
    output=$(nix build .#pnpm-deps 2>&1) || true

    hash=$(printf "%s\n" "$output" |\
      sed -n 's/^[[:space:]]*got:[[:space:]]*\(sha256-[^[:space:]]*\).*$/\1/p' |\
      head -n 1) || true

    if [[ -z "$hash" ]]; then
      echo "::warning::Couldn't detect changed hash, check log if build fails." >&2
      echo "$output" >&2
    fi

    echo "$hash"
  '';
}
