{pkgs, ...}: {
  # https://devenv.sh/basics/
  enterShell = ''
    echo "󰣫 ar-at-localhost"
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

  packages = [pkgs.alejandra];
}
