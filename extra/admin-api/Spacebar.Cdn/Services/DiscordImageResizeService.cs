using System.Runtime.Serialization;

namespace Spacebar.AdminApi.TestClient.Services.Services;

public class DiscordImageResizeParams {
    public uint? Size { get; set; }
    public DiscordImageResizeQuality Quality { get; set; } = DiscordImageResizeQuality.High;
    public bool KeepAspectRatio { get; set; } = true;
    public bool Passthrough { get; set; } = true;
    public bool Animated { get; set; } = true;

    public bool SpacebarAllowUpscale { get; set; } = false;
    public bool SpacebarOptimiseGif { get; set; } = true;

    public string ToSerializedName() {
        return $"{(Animated ? "a_" : "")}{Size}px_{Quality.ToString()}_u.{SpacebarAllowUpscale}_o.{SpacebarOptimiseGif}";
    }
}

public enum DiscordImageResizeQuality {
    [EnumMember(Value = "low")] Low,
    [EnumMember(Value = "high")] High,
    [EnumMember(Value = "lossless")] Lossless
}