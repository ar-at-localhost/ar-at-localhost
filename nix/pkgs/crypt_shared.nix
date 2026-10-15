{stdenv, ...}: let
  srcURL = "https://downloads.mongodb.com/linux/mongo_crypt_shared_v1-linux-x86_64-enterprise-amazon2023-9.0.4.tgz";
in
  stdenv.mkDerivation
  {
    pname = "crypt_shared";
    version = "1.0.0";

    src = builtins.fetchTarball {
      url = srcURL;
      sha256 = "sha256:1i7dz4631l3w8g932pxws9nfn6rw25v9nf5xc6qhzyppgcrqlyjw";
    };

    installPhase = ''
      mkdir -p "$out"
      cp -r . "$out/"
    '';

    meta = {
      maintainers = [];
    };
  }
