_: let
  variables = {
    attic = {
      type = "bool";
      default = "false";
    };

    domain_name = {
      type = "string";
    };

    project_id = {
      type = "string";
    };

    project_name = {
      type = "string";
      default = "ar-at-localhost";
    };

    region = {
      type = "string";
      default = "us-central1";
    };

    secretspec_profile = {
      type = "string";
      default = "ci";
    };

    sops_age_key = {
      type = "string";
      sensitive = true;
    };

    zone = {
      type = "string";
      default = "us-central1-c";
    };
  };
in {
  variable = variables;

  _module.args = {
    ref = {
      vars = builtins.mapAttrs (k: _: "\${var.${k}}") variables;
    };
  };
}
