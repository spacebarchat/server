using System.Security.Cryptography;
using ArcaneLibs.Extensions;
using Microsoft.Extensions.Logging;

namespace Spacebar.Interop.Cdn.Signing;

public class CdnSigningService(ILogger<CdnSigningService> logger, byte[] signatureKey, bool requireUserAgent, bool requireIpAddress, TimeSpan expiryTime) {
    public CdnSignatureResult Sign(CdnSignature data) {
        if (requireIpAddress && string.IsNullOrEmpty(data.IpAddress)) {
            logger.LogWarning("Signing request missing required IP address");
            throw new ArgumentException("IP address is required for signing");
        }

        if (requireUserAgent && string.IsNullOrEmpty(data.UserAgent)) {
            logger.LogWarning("Signing request missing required User-Agent");
            throw new ArgumentException("User-Agent is required for signing");
        }

        var now = DateTimeOffset.UtcNow;
        var expiresAt = now.Add(expiryTime);

        return Hash(new() {
            Path = data.Path,
            IpAddress = data.IpAddress,
            UserAgent = data.UserAgent,
            CreatedAt = now,
            ExpiresAt = expiresAt,
            Signature = null!
        });
    }

    private CdnSignatureResult Hash(CdnSignatureResult data) {
        byte[] signatureData = [
            .. data.Path.AsBytes(),
            .. data.CreatedAt.ToUnixTimeMilliseconds().ToString("x").AsBytes(),
            .. data.ExpiresAt.ToUnixTimeMilliseconds().ToString("x").AsBytes(),
            .. (requireIpAddress ? data.IpAddress?.AsBytes() : []) ?? [],
            .. (requireUserAgent ? data.UserAgent?.AsBytes() : []) ?? []
        ];
        var hash = HMACSHA256.HashData(signatureKey, signatureData).AsHexString().Replace(" ", "").ToLower();

        logger.LogTrace("Hash: creating new hash for {path}", data.Path);
        if (logger.IsEnabled(LogLevel.Trace)) {
            signatureData.HexDump();
        }

        var sr = new CdnSignatureResult() {
            Path = data.Path,
            IpAddress = data.IpAddress,
            UserAgent = data.UserAgent,
            CreatedAt = data.CreatedAt,
            ExpiresAt = data.ExpiresAt,
            Signature = hash,
        };

        logger.LogTrace("Hash: created new hash for {path}, valid between {start} .. {end}: {json}", data.Path, data.CreatedAt, data.ExpiresAt, sr.ToJson());

        return sr;
    }
}