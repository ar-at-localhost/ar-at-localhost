{
  pkgs,
  lib,
  prePnpmInstall ? "",
  ...
}: let
  root = ../.;
  info = builtins.fromJSON (builtins.readFile (root + "/package.json"));
  pname = info.name;
  hashPath = root + "/nix/pnpm-deps.txt";

  hash =
    if builtins.pathExists hashPath
    then (lib.removeSuffix "\n" (builtins.readFile hashPath))
    else lib.fakeHash;

  workspacesManifests = lib.fileset.unions [
    (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/apps"))
    (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/packages"))
    (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/services"))
  ];

  fileset' = lib.fileset.unions [
    (root + "/package.json")
    (root + "/pnpm-workspace.yaml")
    (root + "/pnpm-lock.yaml")
    workspacesManifests
  ];

  workspaces = map (p: (lib.importJSON p).name) (lib.fileset.toList workspacesManifests);
in
  pkgs.fetchPnpmDeps {
    inherit prePnpmInstall pname hash;
    inherit (info) version;
    fetcherVersion = 4;
    pnpmWorkspaces = workspaces;

    src = let
      fileset = fileset';
    in
      lib.fileset.toSource {
        inherit root fileset;
      };
  }
