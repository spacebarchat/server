using System.Runtime.Serialization;
using ImageMagick;
using Microsoft.AspNetCore.Mvc;

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

public enum DiscordImageResizeQuality {
    [EnumMember(Value = "low")] Low,
    [EnumMember(Value = "high")] High,
    [EnumMember(Value = "lossless")] Lossless
}

public class DiscordImageResizeService {
    //(PixelArtDetectionService pads) {
    public MagickImageCollection Apply(MagickImageCollection img, DiscordImageResizeParams resizeParams) {
        if (resizeParams.Passthrough) return img;
        if (img.First().Format == MagickFormat.Gif) {
            Console.WriteLine("Coalescing gif for resize");
            img.Coalesce();
        }

        if (resizeParams.Size.HasValue) {
            if (resizeParams.Size > 4096)
                resizeParams.Size = 4096;

            if (img.Max(x => Math.Max(x.Height, x.Width)) > resizeParams.Size || resizeParams.SpacebarAllowUpscale) {
                Parallel.ForEach(img, new ParallelOptions() { MaxDegreeOfParallelism = 8 }, frame => {
                    if (resizeParams.Size.HasValue) {
                        uint oldWidth = frame.Width, oldHeight = frame.Height;
                        // pads.IsPixelArt(frame)
                        frame.Resize(resizeParams.Size.Value, resizeParams.Size.Value,
                            resizeParams.Quality == DiscordImageResizeQuality.Low ? FilterType.Point : FilterType.Gaussian);
                        Console.WriteLine($"Resized frame from {oldWidth}x{oldHeight} to {frame.Width}x{frame.Height}: {img.IndexOf(frame)}/{img.Count}");
                    }
                });
            }
        }

        if (img.First().Format == MagickFormat.Gif && resizeParams.SpacebarOptimiseGif) {
            Console.WriteLine("Optimizing gif after resize");
            img.OptimizePlus();
        }

        return img;
    }
}