{pkgs, ...}: {
  enterShell = ''
    echo "󰣫 ar-at-localhost"
    echo "󰖟 Playwright: ${pkgs.playwright.version}"
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

  packages = with pkgs; [alejandra playwright];
}
