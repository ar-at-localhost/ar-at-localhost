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
    secretspec run yarn check
    secretspec run yarn test
  '';

  env = {
    inherit MONGO_CRYPT_LIB;
  };

  git-hooks = {
    enable = true;
    hooks = {
      alejandra.enable = true;
      oxlint.enable = true;
      oxfmt.enable = true;
    };
  };

  languages.javascript = {
    enable = true;
    yarn = {
      enable = true;
      install.enable = true;
      package = pkgs.yarn-berry;
    };
  };

  packages = with pkgs; [alejandra libmongocrypt playwright sops];
}
