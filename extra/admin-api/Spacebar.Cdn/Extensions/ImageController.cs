using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.TestClient.Services.Services;

namespace Spacebar.Cdn.Extensions;

public class ImageController : ControllerBase {
    protected DiscordImageResizeParams GetResizeParams() {
        return new() {
            Size = Request.Query.ContainsKey("size") && uint.TryParse(Request.Query["size"], out uint size) ? size : null,
            Quality = Request.Query.ContainsKey("quality") && Enum.TryParse<DiscordImageResizeQuality>(Request.Query["quality"], true, out var quality)
                ? quality
                : DiscordImageResizeQuality.High,
            KeepAspectRatio = !Request.Query.ContainsKey("keepAspectRatio") || !bool.TryParse(Request.Query["keepAspectRatio"], out bool kar) || kar,
            Passthrough = Request.Query.ContainsKey("passthrough") && bool.TryParse(Request.Query["passthrough"], out bool pt) && pt,
            Animated = Request.Query.ContainsKey("animated") && bool.TryParse(Request.Query["animated"], out bool an) && an,
            SpacebarAllowUpscale = Request.Query.ContainsKey("allowUpscale") && bool.TryParse(Request.Query["allowUpscale"], out bool au) && au,
            SpacebarOptimiseGif = Request.Query.ContainsKey("optimiseGif") && bool.TryParse(Request.Query["optimiseGif"], out bool og) && og
        };
    }

    protected void SetSuccessCacheHeader() {
        int cacheDuration = (int)TimeSpan.FromHours(6).TotalSeconds;
        Response.Headers.CacheControl = $"public, max-age={cacheDuration}, s-maxage={cacheDuration}, immutable";
    }

    protected void SetFailureCacheHeader() {
        int cacheDuration = (int)TimeSpan.FromMinutes(5).TotalSeconds;
        Response.Headers.CacheControl = $"public, max-age={cacheDuration}, s-maxage={cacheDuration}, immutable";
    }
}