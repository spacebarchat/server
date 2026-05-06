using System.Text.Json;
using System.Text.Json.Nodes;
using Spacebar.ConfigModel;
using Spacebar.ConfigModel.Extensions;

namespace Spacebar.Models.Config.Tests;

public class EmailConfigurationTests {
    [Fact]
    public void ServerConfigurationSerializesTopLevelEmailDefaults() {
        var json = JsonSerializer.Serialize(new ServerConfiguration());
        var node = JsonNode.Parse(json)!;
        var email = node["email"]!;
        var smtp = email["smtp"]!;
        var mailgun = email["mailgun"]!;
        var mailjet = email["mailjet"]!;
        var sendgrid = email["sendgrid"]!;

        Assert.NotNull(email);
        Assert.Null(email["provider"]);
        Assert.Null(email["senderAddress"]);
        Assert.Null(smtp["host"]);
        Assert.Null(smtp["port"]);
        Assert.Null(smtp["secure"]);
        Assert.False(smtp["starttls"]!.GetValue<bool>());
        Assert.False(smtp["allowInsecure"]!.GetValue<bool>());
        Assert.Null(smtp["username"]);
        Assert.Null(smtp["password"]);
        Assert.Null(mailgun["username"]);
        Assert.Null(mailgun["apiKey"]);
        Assert.Null(mailgun["domain"]);
        Assert.True(mailgun["isEuropean"]!.GetValue<bool>());
        Assert.Null(mailjet["apiKey"]);
        Assert.Null(mailjet["apiSecret"]);
        Assert.Null(sendgrid["apiKey"]);
    }

    [Fact]
    public void ServerConfigurationDeserializesEmailProviders() {
        const string json = """
                            {
                                "email": {
                                    "provider": "smtp",
                                    "senderAddress": "noreply@example.com",
                                    "smtp": {
                                        "host": "smtp.example.com",
                                        "port": 587,
                                        "secure": false,
                                        "starttls": true,
                                        "allowInsecure": false,
                                        "username": "user",
                                        "password": "pass"
                                    },
                                    "mailgun": {
                                        "username": "api",
                                        "apiKey": "mailgun-key",
                                        "domain": "mg.example.com",
                                        "isEuropean": false
                                    },
                                    "mailjet": {
                                        "apiKey": "mailjet-key",
                                        "apiSecret": "mailjet-secret"
                                    },
                                    "sendgrid": {
                                        "apiKey": "sendgrid-key"
                                    }
                                }
                            }
                            """;

        var config = JsonSerializer.Deserialize<ServerConfiguration>(json);

        Assert.NotNull(config);
        AssertConfiguredEmail(config.Email, smtpAllowInsecure: false);
    }

    [Fact]
    public void FlatEmailConfigKeysDeserializeIntoServerConfiguration() {
        var flat = CreateConfiguredFlatEmailKeys();

        var nested = flat.ToNestedJsonObject();
        var config = nested.Deserialize<ServerConfiguration>();

        Assert.NotNull(config);
        AssertConfiguredEmail(config.Email, smtpAllowInsecure: true);
        Assert.True(config.Register.Email.Required);
    }

    [Fact]
    public void EmailConfigurationRoundTripsThroughFlatConfigKeys() {
        var nested = new JsonObject {
            ["email"] = new JsonObject {
                ["provider"] = "smtp",
                ["senderAddress"] = "noreply@example.com",
                ["smtp"] = new JsonObject {
                    ["host"] = "smtp.example.com",
                    ["port"] = 587,
                    ["secure"] = false,
                    ["starttls"] = true,
                    ["allowInsecure"] = true,
                    ["username"] = "user",
                    ["password"] = "pass",
                },
                ["mailgun"] = new JsonObject {
                    ["username"] = "api",
                    ["apiKey"] = "mailgun-key",
                    ["domain"] = "mg.example.com",
                    ["isEuropean"] = false,
                },
                ["mailjet"] = new JsonObject {
                    ["apiKey"] = "mailjet-key",
                    ["apiSecret"] = "mailjet-secret",
                },
                ["sendgrid"] = new JsonObject {
                    ["apiKey"] = "sendgrid-key",
                },
            },
            ["register"] = new JsonObject {
                ["email"] = new JsonObject {
                    ["required"] = true,
                },
            },
        };

        var flat = nested.ToFlatKv();
        var roundTrip = flat.ToNestedJsonObject();
        var config = roundTrip.Deserialize<ServerConfiguration>();
        var expectedFlat = CreateConfiguredFlatEmailKeys();

        Assert.Equal(expectedFlat.OrderBy(x => x.Key), flat.OrderBy(x => x.Key));
        Assert.NotNull(config);
        AssertConfiguredEmail(config.Email, smtpAllowInsecure: true);
        Assert.True(config.Register.Email.Required);
    }

    private static Dictionary<string, string?> CreateConfiguredFlatEmailKeys() {
        return new Dictionary<string, string?> {
            ["email_provider"] = "\"smtp\"",
            ["email_senderAddress"] = "\"noreply@example.com\"",
            ["email_smtp_host"] = "\"smtp.example.com\"",
            ["email_smtp_port"] = "587",
            ["email_smtp_secure"] = "false",
            ["email_smtp_starttls"] = "true",
            ["email_smtp_allowInsecure"] = "true",
            ["email_smtp_username"] = "\"user\"",
            ["email_smtp_password"] = "\"pass\"",
            ["email_mailgun_username"] = "\"api\"",
            ["email_mailgun_apiKey"] = "\"mailgun-key\"",
            ["email_mailgun_domain"] = "\"mg.example.com\"",
            ["email_mailgun_isEuropean"] = "false",
            ["email_mailjet_apiKey"] = "\"mailjet-key\"",
            ["email_mailjet_apiSecret"] = "\"mailjet-secret\"",
            ["email_sendgrid_apiKey"] = "\"sendgrid-key\"",
            ["register_email_required"] = "true",
        };
    }

    private static void AssertConfiguredEmail(EmailConfiguration email, bool smtpAllowInsecure) {
        Assert.Equal("smtp", email.Provider);
        Assert.Equal("noreply@example.com", email.SenderAddress);
        Assert.Equal("smtp.example.com", email.Smtp.Host);
        Assert.Equal(587, email.Smtp.Port);
        Assert.False(email.Smtp.Secure);
        Assert.True(email.Smtp.Starttls);
        Assert.Equal(smtpAllowInsecure, email.Smtp.AllowInsecure);
        Assert.Equal("user", email.Smtp.Username);
        Assert.Equal("pass", email.Smtp.Password);
        Assert.Equal("api", email.Mailgun.Username);
        Assert.Equal("mailgun-key", email.Mailgun.ApiKey);
        Assert.Equal("mg.example.com", email.Mailgun.Domain);
        Assert.False(email.Mailgun.IsEuropean);
        Assert.Equal("mailjet-key", email.Mailjet.ApiKey);
        Assert.Equal("mailjet-secret", email.Mailjet.ApiSecret);
        Assert.Equal("sendgrid-key", email.Sendgrid.ApiKey);
    }
}
