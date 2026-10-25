{
  hash ? (builtins.readFile ../hash.txt),
  pname ? null,
  pkgs,
  lib,
  version ? null,
  ...
}: let
  root = ../../.;
  info = builtins.fromJSON (builtins.readFile (root + "/package.json"));
in
  pkgs.fetchPnpmDeps {
    inherit hash;
    fetcherVersion = 4;

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

    pname =
      if pname != null
      then pname
      else info.name;
    version =
      if version != null
      then version
      else info.version;
  }
