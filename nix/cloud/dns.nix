_: let
  count = ''''${ var.secretspec_profile == "prod" ? 1 : 0 }'';
  domain = "\${var.domain_name}";
  dns_name = "\${google_dns_managed_zone.main[0].dns_name}";
  quote = s: "\"${s}\"";
  mkRecord = {
    ttl ? 3600,
    type ? "TXT",
    name ? dns_name,
    rrdatas ? [],
  }: {
    inherit count name ttl type;
    managed_zone = "\${google_dns_managed_zone.main[0].name}";
    rrdatas =
      if type == "TXT"
      then (map quote rrdatas)
      else rrdatas;
  };
in {
  resource = {
    google_dns_managed_zone.main = {
      inherit count;
      name = "\${replace(var.domain_name, \".\", \"-\")}";
      dns_name = "${domain}.";
      description = "DNS for domain ${domain}";
      depends_on = ["google_project_service.dns"];
    };

    google_dns_record_set = {
      app-production = mkRecord {
        type = "A";
        rrdatas = ["199.36.158.100"];
      };

      app-staging = mkRecord {
        name = "staging.${dns_name}";
        type = "CNAME";
        rrdatas = ["ar-at-localhost-staging.web.app."];
      };

      dmarc = mkRecord {
        name = "_dmarc.${dns_name}";
        rrdatas = ["v=DMARC1; p=none;"];
      };

      mx = mkRecord {
        type = "MX";
        rrdatas = ["10 mx1.privateemail.com." "10 mx2.privateemail.com."];
      };

      mail-dkim = mkRecord {
        name = "resend._domainkey.${dns_name}";
        rrdatas = ["p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMbffK+AkXA9xlrJUEfSowwXs81U6MBGBzGS5kvPMpAERiM87Q1fQEl3F1vXq+4bnMq2dhqBIMShn/jFKcgJhYuQRaRZ74K+G6TKgdmRZzUYNqxv2DEy1uUYXMeD9slZ2DLVxVmCEZzzPKGJnx2oZPcREwioWcmBA6g7/s1l6bkwIDAQAB"];
      };

      mail-send = mkRecord {
        name = "send.${dns_name}";
        type = "CNAME";
        rrdatas = ["send.forge.rmta.net."];
      };

      mail-rsend = mkRecord {
        name = "rsend.${dns_name}";
        type = "CNAME";
        rrdatas = ["rsend-apne1.forge.rmta.net."];
      };

      txt = mkRecord {
        rrdatas = ["v=spf1 include:spf.privateemail.com ~all" "google-site-verification=YTL0kSa9Aj3RTo7A054IdBpR090SFU2s4f9vG8-PoSg" "hosting-site=ar-at-localhost"];
      };
    };
  };

  output.nameservers.value = "\${var.attic == true ? try(google_dns_managed_zone.main[0].name_servers, null) : null}";
}
