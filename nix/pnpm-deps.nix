{
  pkgs,
  lib,
  workspace,
  ...
}: let
  root = ../.;
  packagePath = workspace + "/package.json";
  hashPath = workspace + "/nix-hash.txt";
  info = lib.importJSON packagePath;
  pname = info.name;

  hash =
    if builtins.pathExists hashPath
    then (lib.removeSuffix "\n" (builtins.readFile hashPath))
    else lib.fakeHash;

  fileset' = lib.fileset.unions [
    (root + "/package.json")
    (root + "/pnpm-workspace.yaml")
    (root + "/pnpm-lock.yaml")
    (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/apps"))
    (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/packages"))
    (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/services"))
  ];
in
  pkgs.fetchPnpmDeps {
    inherit pname hash;
    inherit (info) version;
    fetcherVersion = 4;
    pnpmWorkspaces = ["lib" "lib-server" pname];

    src = let
      fileset = fileset';
    in
      lib.fileset.toSource {
        inherit root fileset;
      };
  }
