{ lib, config, ... }:
let
  cfg = config.services.spacebarchat-server;
in
{
  options = {
    cdnSignaturePath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    legacyJwtSecretPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    mailjetApiKeyPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    mailjetApiSecretPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    smtpPasswordPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    gifApiKeyPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    rabbitmqHost = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    rabbitmqHostPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    abuseIpDbApiKeyPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    captchaSecretKeyPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    captchaSiteKeyPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    ipdataApiKeyPath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
    requestSignaturePath = lib.mkOption {
      type = lib.types.nullOr lib.types.str;
      default = null;
      description = "Path to the secret";
    };
  };

  systemdLoadCredentials =
    [ ]
    ++ (if cfg.cdnSignaturePath != null then [ "cdnSignature:${cfg.cdnSignaturePath}" ] else [ ])
    ++ (if cfg.legacyJwtSecretPath != null then [ "legacyJwtSecret:${cfg.legacyJwtSecretPath}" ] else [ ])
    ++ (if cfg.mailjetApiKeyPath != null then [ "mailjetApiKey:${cfg.mailjetApiKeyPath}" ] else [ ])
    ++ (if cfg.mailjetApiSecretPath != null then [ "mailjetApiSecret:${cfg.mailjetApiSecretPath}" ] else [ ])
    ++ (if cfg.smtpPasswordPath != null then [ "smtpPassword:${cfg.smtpPasswordPath}" ] else [ ])
    ++ (if cfg.gifApiKeyPath != null then [ "gifApiKey:${cfg.gifApiKeyPath}" ] else [ ])
    ++ (if cfg.rabbitmqHostPath != null then [ "rabbitmqHost:${cfg.rabbitmqHostPath}" ] else [ ])
    ++ (if cfg.abuseIpDbApiKeyPath != null then [ "abuseIpDbApiKey:${cfg.abuseIpDbApiKeyPath}" ] else [ ])
    ++ (if cfg.captchaSecretKeyPath != null then [ "captchaSecretKey:${cfg.captchaSecretKeyPath}" ] else [ ])
    ++ (if cfg.captchaSiteKeyPath != null then [ "captchaSiteKey:${cfg.captchaSiteKeyPath}" ] else [ ])
    ++ (if cfg.ipdataApiKeyPath != null then [ "ipdataApiKey:${cfg.ipdataApiKeyPath}" ] else [ ])
    ++ (if cfg.requestSignaturePath != null then [ "requestSignature:${cfg.requestSignaturePath}" ] else [ ]);

  systemdEnvironment =
    { }
    // (if cfg.cdnSignaturePath != null then { CDN_SIGNATURE_PATH = "%d/cdnSignature"; } else { })
    // (if cfg.legacyJwtSecretPath != null then { LEGACY_JWT_SECRET_PATH = "%d/legacyJwtSecret"; } else { })
    // (if cfg.mailjetApiKeyPath != null then { MAILJET_API_KEY_PATH = "%d/mailjetApiKey"; } else { })
    // (if cfg.mailjetApiSecretPath != null then { MAILJET_API_SECRET_PATH = "%d/mailjetApiSecret"; } else { })
    // (if cfg.smtpPasswordPath != null then { SMTP_PASSWORD_PATH = "%d/smtpPassword"; } else { })
    // (if cfg.gifApiKeyPath != null then { GIF_API_KEY_PATH = "%d/gifApiKey"; } else { })
    // (if cfg.rabbitmqHostPath != null then { RABBITMQ_HOST_PATH = "%d/rabbitmqHost"; } else { })
    // (if cfg.abuseIpDbApiKeyPath != null then { ABUSE_IP_DB_API_KEY_PATH = "%d/abuseIpDbApiKey"; } else { })
    // (if cfg.captchaSecretKeyPath != null then { CAPTCHA_SECRET_KEY_PATH = "%d/captchaSecretKey"; } else { })
    // (if cfg.captchaSiteKeyPath != null then { CAPTCHA_SITE_KEY_PATH = "%d/captchaSiteKey"; } else { })
    // (if cfg.ipdataApiKeyPath != null then { IPDATA_API_KEY_PATH = "%d/ipdataApiKey"; } else { })
    // (if cfg.requestSignaturePath != null then { REQUEST_SIGNATURE_PATH = "%d/requestSignature"; } else { });
}
