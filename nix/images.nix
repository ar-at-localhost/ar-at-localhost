{
  lib,
  pkgs,
  ...
}: let
  lib' = import ./lib.nix {
    inherit lib pkgs;
  };

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
