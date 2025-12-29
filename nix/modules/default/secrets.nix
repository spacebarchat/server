{ lib, ... }:
{
  options.services.spacebarchat-server = {
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
}
