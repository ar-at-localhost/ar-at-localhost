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
      echo "Failed to generate pnpm hash" >&2
    fi

    echo "$hash"
  '';
}
