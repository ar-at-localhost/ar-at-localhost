{
  lib,
  pkgs,
  ...
}: let
  httpMethods = ["delete" "get" "head" "options" "patch" "post" "put"];

  mkSrvPkg = {service, ...}: let
    package = service + "/package.json";
    info = builtins.fromJSON (builtins.readFile package);
    inherit (info) name version;
  in
    pkgs.stdenv.mkDerivation (finalAttrs: {
      pname = name;
      inherit version;
      src = lib.fileset.toSource {
        root = ../.;
        fileset = lib.fileset.unions [
          ../package.json
          ../pnpm-lock.yaml
          ../pnpm-workspace.yaml
          ../turbo.json
          ../packages
          ../secrets
          ../secretspec.toml
          service
          ../.sops.yaml
        ];
      };

      nativeBuildInputs = with pkgs; [
        python3
        nodejs
        node-gyp
        pnpm
        pnpmConfigHook
        pkg-config
      ];

      pnpmDeps = pkgs.callPackage ./pkgs/pnpm-deps.nix {
        inherit (finalAttrs) pname version;
      };

      buildPhase = ''
        runHook preBuild
        pnpm turbo --filter ${name} build
        runHook postBuild
      '';

      installPhase = ''
        runHook preInstall

        pnpm --offline --filter="${name}" deploy -P $out/srv
        cp -r secrets/ secretspec.toml .sops.yaml $out/srv

        runHook postInstall
      '';
    });

  mkSrvImage = {service, ...}:
    pkgs.dockerTools.buildLayeredImage (
      let
        package = service + "/package.json";
        info = builtins.fromJSON (builtins.readFile package);
        inherit (info) name version;
        srv = mkSrvPkg {inherit service;};
      in {
        inherit name;
        tag = version;
        uid = 1000;
        gid = 1000;
        contents = [srv pkgs.dockerTools.caCertificates] ++ (with pkgs; [nodejs secretspec sops]);

        config = {
          Env = [
            "PATH=/bin"
            "SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt"
            "NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-bundle.crt"
          ];

          Cmd = [
            "secretspec"
            "run"
            "--"
            "node"
            "dist/index.mjs"
          ];

          WorkingDir = "/srv";
        };
      }
    );

  servicesDir = ../services/. + "/";
  dirs = path: lib.filterAttrs (_: type: type == "directory") (builtins.readDir path);

  services = lib.concatMapAttrs (
    group: _:
      lib.mapAttrs' (
        name: _: let
          path = servicesDir + "/${group}/${name}";
          package = builtins.fromJSON (builtins.readFile (path + "/package.json"));
        in
          lib.nameValuePair package.name path
      ) (
        lib.filterAttrs (
          name: _: (builtins.pathExists (servicesDir + "/${group}/${name}/package.json"))
        ) (dirs (servicesDir + "/${group}"))
      )
  ) (dirs servicesDir);

  attic = {
    image = pkgs.dockerTools.buildLayeredImage (
      let
        name = "attic";
        version = "0.0.1";
      in {
        inherit name;
        tag = version;

        contents =
          [
            (pkgs.stdenv.mkDerivation {
              pname = "attic-context";
              inherit version;
              dontBuild = true;

              src = lib.fileset.toSource {
                root = ../.;
                fileset = lib.fileset.unions [
                  ../attic-template.toml
                  ../secrets
                  ../secretspec.toml
                  ../.sops.yaml
                ];
              };

              installPhase = ''
                mkdir -p "$out/attic"
                cp -rf "$src/." "$out/attic"
              '';
            })
            (pkgs.writeShellScriptBin "attic-server.sh" ''
              set -euo pipefail
              attic_ctx="/atticd-ctx"
              attic_cfg="$attic_ctx/attic.toml"
              "${pkgs.coreutils}/bin/mkdir" -p "$attic_ctx"
              ${pkgs.secretspec}/bin/secretspec run ${pkgs.envsubst}/bin/envsubst -i ./attic-template.toml -o "$attic_cfg"
              exec ${pkgs.attic-server}/bin/atticd --config "$attic_cfg"
            '')
          ]
          ++ (with pkgs; [attic-client attic-server bash coreutils dockerTools.caCertificates openssl secretspec sops]);

        config = {
          Env = [
            "PATH=/bin"
            "SSL_CERT_FILE=/etc/ssl/certs/ca-bundle.crt"
          ];

          Cmd = [
            "bash"
            "-c"
            "/bin/attic-server.sh"
          ];

          WorkingDir = "/attic";
        };
      }
    );
  };
in {
  inherit attic httpMethods mkSrvPkg mkSrvImage services;
}
