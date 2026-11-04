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
    (lib.fileset.fileFilter (f: f.name == "package.json" || f.name == "nix-hash.txt") (root + "/apps"))
    (lib.fileset.fileFilter (f: f.name == "package.json" || f.name == "nix-hash.txt") (root + "/packages"))
    (lib.fileset.fileFilter (f: f.name == "package.json" || f.name == "nix-hash.txt") (root + "/services"))
  ];
in
  pkgs.fetchPnpmDeps {
    inherit pname hash;
    inherit (info) version;
    fetcherVersion = 4;
    pnpmWorkspaces = [pname];

    src = let
      fileset = fileset';
    in
      lib.fileset.toSource {
        inherit root fileset;
      };
  }
