using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.TestClient.Services.Services;

namespace Spacebar.Cdn.Extensions;


public static class HttpRequestExtensions {
    extension(HttpRequest request) {
        public DiscordImageResizeParams GetResizeParams() {
            return new() {
                Size = request.Query.ContainsKey("size") && uint.TryParse(request.Query["size"], out uint size) ? size : null,
                Quality = request.Query.ContainsKey("quality") && Enum.TryParse<DiscordImageResizeQuality>(request.Query["quality"], true, out var quality)
                    ? quality
                    : DiscordImageResizeQuality.High,
                KeepAspectRatio = !request.Query.ContainsKey("keepAspectRatio") || !bool.TryParse(request.Query["keepAspectRatio"], out bool kar) || kar,
                Passthrough = request.Query.ContainsKey("passthrough") && bool.TryParse(request.Query["passthrough"], out bool pt) && pt,
                Animated = request.Query.ContainsKey("animated") && bool.TryParse(request.Query["animated"], out bool an) && an,
                SpacebarAllowUpscale = request.Query.ContainsKey("allowUpscale") && bool.TryParse(request.Query["allowUpscale"], out bool au) && au,
                SpacebarOptimiseGif = request.Query.ContainsKey("optimiseGif") && bool.TryParse(request.Query["optimiseGif"], out bool og) && og,
            };
        }
    }
    
    extension (HttpResponse response) {
        public void SetSuccessCacheHeader() {
            int cacheDuration = (int)TimeSpan.FromHours(6).TotalSeconds;
            response.Headers.CacheControl = $"public, max-age={cacheDuration}, s-maxage={cacheDuration}, immutable";
        }

        public void SetFailureCacheHeader() {
            int cacheDuration = (int)TimeSpan.FromMinutes(5).TotalSeconds;
            response.Headers.CacheControl = $"public, max-age={cacheDuration}, s-maxage={cacheDuration}, immutable";
        }
    }
}