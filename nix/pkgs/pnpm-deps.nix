{
  hash ? (builtins.readFile ../hash.txt),
  pkgs,
  lib,
  ...
}: let
  root = ../../.;
  info = builtins.fromJSON (builtins.readFile (root + "/package.json"));
in
  pkgs.fetchPnpmDeps {
    pname = info.name;
    inherit (info) version;
    fetcherVersion = 4;
    inherit hash;

    src = lib.fileset.toSource {
      inherit root;
      fileset = lib.fileset.unions [
        (root + "/package.json")
        (root + "/pnpm-workspace.yaml")
        (root + "/pnpm-lock.yaml")
        (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/apps"))
        (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/packages"))
        (lib.fileset.fileFilter (f: f.name == "package.json") (root + "/services"))
      ];
    };
  }
