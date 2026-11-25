{lib, ...}: let
  lib' = lib.self;

  services =
    lib.mapAttrs' (name: service: {
      inherit name;
      value = lib'.mkSrvPkg {inherit service;};
    })
    lib'.services;
in
  services
