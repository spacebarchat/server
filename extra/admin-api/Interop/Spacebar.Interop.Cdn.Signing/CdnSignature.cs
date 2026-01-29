namespace Spacebar.Interop.Cdn.Signing;

public class CdnSignature {
    public string Path { get; set; } = string.Empty;
    public string? IpAddress { get; set; } = string.Empty;
    public string? UserAgent { get; set; } = string.Empty;
}

public class CdnSignatureResult : CdnSignature {
    // hm
    public required string Signature { get; set; }

    // is
    public required DateTimeOffset CreatedAt { get; set; }

    // ex
    public required DateTimeOffset ExpiresAt { get; set; }

    public string GetSignedPath() {
        return $"{Path}?is={CreatedAt.ToUnixTimeMilliseconds():x}&ex={ExpiresAt.ToUnixTimeMilliseconds():x}&hm={Signature}";
    }
}