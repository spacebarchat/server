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

        Assert.NotNull(node["email"]);
        Assert.Null(node["email"]!["provider"]);
        Assert.Null(node["email"]!["senderAddress"]);
        Assert.False(node["email"]!["smtp"]!["starttls"]!.GetValue<bool>());
        Assert.False(node["email"]!["smtp"]!["allowInsecure"]!.GetValue<bool>());
        Assert.True(node["email"]!["mailgun"]!["isEuropean"]!.GetValue<bool>());
        Assert.NotNull(node["email"]!["mailjet"]);
        Assert.NotNull(node["email"]!["sendgrid"]);
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
        Assert.Equal("smtp", config.Email.Provider);
        Assert.Equal("noreply@example.com", config.Email.SenderAddress);
        Assert.Equal("smtp.example.com", config.Email.Smtp.Host);
        Assert.Equal(587, config.Email.Smtp.Port);
        Assert.False(config.Email.Smtp.Secure);
        Assert.True(config.Email.Smtp.Starttls);
        Assert.False(config.Email.Smtp.AllowInsecure);
        Assert.Equal("user", config.Email.Smtp.Username);
        Assert.Equal("pass", config.Email.Smtp.Password);
        Assert.Equal("api", config.Email.Mailgun.Username);
        Assert.Equal("mailgun-key", config.Email.Mailgun.ApiKey);
        Assert.Equal("mg.example.com", config.Email.Mailgun.Domain);
        Assert.False(config.Email.Mailgun.IsEuropean);
        Assert.Equal("mailjet-key", config.Email.Mailjet.ApiKey);
        Assert.Equal("mailjet-secret", config.Email.Mailjet.ApiSecret);
        Assert.Equal("sendgrid-key", config.Email.Sendgrid.ApiKey);
    }

    [Fact]
    public void EmailConfigurationRoundTripsThroughFlatConfigKeys() {
        var nested = new JsonObject {
            ["email"] = new JsonObject {
                ["provider"] = "mailgun",
                ["senderAddress"] = "noreply@example.com",
                ["smtp"] = new JsonObject {
                    ["password"] = "smtp-secret",
                    ["starttls"] = true,
                },
                ["mailgun"] = new JsonObject {
                    ["apiKey"] = "mailgun-key",
                    ["isEuropean"] = true,
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

        Assert.Equal("\"mailgun\"", flat["email_provider"]);
        Assert.Equal("\"smtp-secret\"", flat["email_smtp_password"]);
        Assert.Equal("true", flat["email_mailgun_isEuropean"]);
        Assert.Equal("true", flat["register_email_required"]);
        Assert.Equal("mailgun", roundTrip["email"]!["provider"]!.GetValue<string>());
        Assert.Equal("smtp-secret", roundTrip["email"]!["smtp"]!["password"]!.GetValue<string>());
        Assert.True(roundTrip["email"]!["mailgun"]!["isEuropean"]!.GetValue<bool>());
        Assert.True(roundTrip["register"]!["email"]!["required"]!.GetValue<bool>());
    }
}
