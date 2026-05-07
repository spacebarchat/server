using System.Text.Json.Serialization;

namespace Spacebar.ConfigModel;

public class EmailConfiguration {
    [JsonPropertyName("provider")]
    public string? Provider { get; set; }

    [JsonPropertyName("senderAddress")]
    public string? SenderAddress { get; set; }

    [JsonPropertyName("smtp")]
    public SmtpConfiguration Smtp { get; set; } = new();

    [JsonPropertyName("mailgun")]
    public MailGunConfiguration Mailgun { get; set; } = new();

    [JsonPropertyName("mailjet")]
    public MailJetConfiguration Mailjet { get; set; } = new();

    [JsonPropertyName("sendgrid")]
    public SendGridConfiguration Sendgrid { get; set; } = new();
}

public class SmtpConfiguration {
    [JsonPropertyName("host")]
    public string? Host { get; set; }

    [JsonPropertyName("port")]
    public int? Port { get; set; }

    [JsonPropertyName("secure")]
    public bool? Secure { get; set; }

    [JsonPropertyName("starttls")]
    public bool Starttls { get; set; } = false;

    [JsonPropertyName("allowInsecure")]
    public bool AllowInsecure { get; set; } = false;

    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }
}

public class MailGunConfiguration {
    [JsonPropertyName("username")]
    public string? Username { get; set; }

    [JsonPropertyName("apiKey")]
    public string? ApiKey { get; set; }

    [JsonPropertyName("domain")]
    public string? Domain { get; set; }

    [JsonPropertyName("isEuropean")]
    public bool IsEuropean { get; set; } = true;
}

public class MailJetConfiguration {
    [JsonPropertyName("apiKey")]
    public string? ApiKey { get; set; }

    [JsonPropertyName("apiSecret")]
    public string? ApiSecret { get; set; }
}

public class SendGridConfiguration {
    [JsonPropertyName("apiKey")]
    public string? ApiKey { get; set; }
}
