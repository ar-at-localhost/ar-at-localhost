{
  lib,
  pkgs,
  ...
}: let
  crypt_shared = pkgs.callPackage ./pkgs/crypt_shared.nix {};
  httpMethods = ["delete" "get" "head" "options" "patch" "post" "put"];
  mongocrypt = pkgs.fetchurl {
    url = "https://github.com/mongodb-js/mongodb-client-encryption/releases/download/v7.2.1/mongodb-client-encryption-v7.2.1-napi-v9-linux-x64.tar.gz";
    hash = "sha256-A5Yhbhf83xh817sd7c2CFuzCC0CZmG960aRQCVQufms=";
  };

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
        crypt_shared
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

        sed -i 's/mongodb-client-encryption: true/mongodb-client-encryption: false/' pnpm-workspace.yaml
        grep -q 'mongodb-client-encryption: false' pnpm-workspace.yaml
        pnpm --offline --filter="${name}" deploy -P $out/srv
        cp -r secrets/ secretspec.toml .sops.yaml $out/srv

        # install mongodb-client-encryption
        dir="$out/srv/node_modules/.pnpm/mongodb-client-encryption@7.2.1/node_modules/mongodb-client-encryption"
        tar -xzf ${mongocrypt} -C "$dir"
        test -f "$dir/build/Release/mongocrypt.node"

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
        contents = [crypt_shared srv] ++ (with pkgs; [nodejs secretspec sops]);

        config = {
          Env = [
            "MONGO_CRYPT_LIB=${crypt_shared}/lib/mongo_crypt_v1.so"
            "PATH=/bin"
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
in {
  inherit httpMethods mkSrvPkg mkSrvImage services;
}
