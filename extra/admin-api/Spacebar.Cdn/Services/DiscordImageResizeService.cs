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
    public bool SpacebarOptimiseGif {get;set;} = true;
}

public enum DiscordImageResizeQuality {
    [EnumMember(Value = "low")] Low,
    [EnumMember(Value = "high")] High,
    [EnumMember(Value = "lossless")] Lossless
}

public class DiscordImageResizeService(PixelArtDetectionService pads) {
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
                Parallel.ForEach(img,  new ParallelOptions(){MaxDegreeOfParallelism = 8}, frame => {
                    if (resizeParams.Size.HasValue) {
                        uint oldWidth = frame.Width, oldHeight = frame.Height;
                        frame.Resize(resizeParams.Size.Value, resizeParams.Size.Value, pads.IsPixelArt(frame) ? FilterType.Point : FilterType.Gaussian);
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