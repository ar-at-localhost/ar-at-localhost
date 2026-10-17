{pkgs, ...}: let
  crypt_shared = pkgs.callPackage ./nix/pkgs/crypt_shared.nix {};
  MONGO_CRYPT_LIB = "${crypt_shared}/lib/mongo_crypt_v1.so";
in {
  enterShell = ''
    echo "󰣫 ar-at-localhost"
    echo "󰖟 Playwright: ${pkgs.playwright.version}"
    echo " Mongocrypt: ${MONGO_CRYPT_LIB}"
  '';

  enterTest = ''
    secretspec run pnpm check
    secretspec run pnpm test
  '';

  env = {
    inherit MONGO_CRYPT_LIB;
  };

  git-hooks = {
    enable = true;
    hooks = let
      stages = ["pre-commit" "pre-push"];
    in {
      alejandra = {
        enable = true;
        inherit stages;
      };

      oxlint = {
        enable = true;
        inherit stages;
      };

      oxfmt = {
        enable = true;
        inherit stages;
      };
    };
  };

  languages.javascript = {
    enable = true;
    pnpm = {
      enable = true;
      install.enable = true;
    };
  };

  packages = with pkgs; [alejandra libmongocrypt playwright sops];

  processes."api:start" = {
    exec = "secretspec run node apps/api/dist/index.mjs";
  };

  tasks."api:build" = {
    exec = "pnpm --filter api build";
    before = ["devenv:processes:api:start"];
  };
}
