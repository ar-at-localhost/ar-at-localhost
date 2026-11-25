{
  lib,
  pkgs,
  ...
}: let
  lib' = lib.self;

  images =
    lib.mapAttrs' (name: service: {
      inherit name;
      value = lib'.mkSrvImage {inherit pkgs service;};
    })
    lib'.services;
in
  images
  // {
    attic = lib'.attic.image;
  }
