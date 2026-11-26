{
  description = "ar-at-localhost";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?rev=48752ce043f693c1b57296b2f27cc392900f33f1";

    terranix = {
      url = "github:terranix/terranix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = {self, ...} @ inputs: let
    inherit (inputs.nixpkgs) lib;

    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
    ];

    forEachSupportedSystem = f:
      lib.genAttrs supportedSystems (
        system:
          f (let
            pkgs = import inputs.nixpkgs {
              inherit system;

              overlays = [
                (_: prev: {
                  lib = prev.lib.extend (_: __: {
                    self = prev.callPackage ./nix/lib.nix {
                      inherit inputs;
                    };
                  });
                })
              ];
            };

            inherit (pkgs) lib;
          in {
            inherit self system inputs;
            inherit pkgs;
            lib =
              lib
              // {
                self = import ./nix/lib.nix {
                  inherit inputs lib system pkgs;
                };
              };
          })
      );
  in {
    images = forEachSupportedSystem (
      {
        pkgs,
        lib,
        ...
      }:
        import ./nix/images.nix {
          inherit pkgs lib;
        }
    );

    tf = forEachSupportedSystem (
      {
        inputs,
        lib,
        pkgs,
        system,
        ...
      }: let
        callTF = path:
          pkgs.callPackage path {
            inherit inputs lib pkgs system;
          };

        inherit (lib.self) mkTf;
      in
        (callTF ./nix/cloud/services)
        // {
          default = mkTf ./nix/cloud;
          common = mkTf ./nix/cloud/common;
          gateway = mkTf ./nix/cloud/gateway;
        }
    );

    packages = forEachSupportedSystem (
      {
        pkgs,
        lib,
        ...
      }:
        {
          gcloud = pkgs.google-cloud-sdk.withExtraComponents [pkgs.google-cloud-sdk.components.cloud-run-proxy];

          health = pkgs.writeShellScriptBin "aal-health" ''
            echo "OK..."
          '';
        }
        // (import ./nix/pkgs/services.nix {inherit lib pkgs;})
    );

    apps = forEachSupportedSystem (
      {pkgs, ...}: let
        inherit (pkgs) lib;
      in {
        hash-check = {
          type = "app";

          program = lib.getExe (pkgs.writeShellApplication {
            name = "hash-check";
            runtimeInputs = with pkgs; [git nodejs pnpm];

            text = ''
              service="$1"
              echo "  Running nix pnpm hash check for package: ''${service}"

              output="$(mktemp)"
              trap  'rm -rf "$output"' EXIT
              hash_path="./services/microservices/''${service#srv-}/nix-hash.txt"
              specified_hash="sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
              got_hash=""

              if [[ -f "$hash_path" ]]; then
                specified_hash="$(cat "$hash_path")"
              fi
              echo "| Hash file path: $hash_path"
              echo "| Specified Hash: $specified_hash"

              echo "> Building package..."
              code=0
              nix build -L ".#$service" > "$output" 2>&1 || code="$?"

              if [[ $code -eq 0 ]]; then
                echo "| OK: Package built successfully - current hash is verified!"
                exit 0
              fi

              got_hash=$(printf "%s\n" "$(cat "$output")" |\
                sed -n 's/^[[:space:]]*got:[[:space:]]*\(sha256-[^[:space:]]*\).*$/\1/p' |\
                head -n 1) || true

              if [[ "$got_hash" != sha256-* ]]; then
                echo "::error::| Build failed without hash mismatch." >&2
                echo "| pnpm: $(pnpm --version)"
                echo "::error:: Error not recoverable, exiting, inspect output below..."
                cat "$output"
                exit 1
              fi

              echo "::error::| Error: build failed due to hash mismatch."
              echo "| Actual Hash: $got_hash"

              if [[ "''${UPDATE_HASH_FILE:-}" == "true" ]]; then
                echo "> Updating actual hash..."
                echo "$got_hash" > "$hash_path"
              fi
            '';
          });
        };
      }
    );
  };
}
