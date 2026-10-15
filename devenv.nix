{pkgs, ...}: {
  enterShell = ''
    echo "󰣫 ar-at-localhost"
    echo "󰖟 Playwright: ${pkgs.playwright.version}"
    echo " Mongocrypt: $MONGO_CRYPT_LIB"
  '';

  enterTest = ''
    secretspec run yarn check
    secretspec run yarn test
  '';

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

  packages = with pkgs; [alejandra libmongocrypt playwright];
}
