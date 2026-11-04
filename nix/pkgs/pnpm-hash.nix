{pkgs, ...}:
pkgs.writeShellApplication {
  name = "pnpm-hash";
  runtimeInputs = with pkgs; [nix gnused coreutils];

  # Ensures that hash is up to date
  # Out: Prints desired hash if it mismatches
  # Out: Prints nothing if hash is already up to date. DO NOT WRITE, IF OK.
  text = ''
    output="$(mktemp)"
    trap  'rm -rf "$output"' EXIT

    code=0
    nix build .#pnpm-deps > "$output" 2>&1 || code="$?"

    if [[ $code -ne 0 ]]; then
      hash=$(printf "%s\n" "$(cat "$output")" |\
        sed -n 's/^[[:space:]]*got:[[:space:]]*\(sha256-[^[:space:]]*\).*$/\1/p' |\
        head -n 1) || true

      if [[ -z "$hash" ]]; then
        echo "::error::pnpm-hash: Couldn't detect changed hash:" >&2
        cat "$output" >&2
        exit 1
      else
        echo "$hash"
      fi
    fi
  '';
}
