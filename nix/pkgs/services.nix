{
  lib,
  pkgs,
  ...
}: let
  lib' = import ../lib.nix {
    inherit lib pkgs;
  };

  services =
    lib.mapAttrs' (name: service: {
      inherit name;
      value = lib'.mkSrvPkg {inherit service;};
    })
    lib'.services;
in
  services
