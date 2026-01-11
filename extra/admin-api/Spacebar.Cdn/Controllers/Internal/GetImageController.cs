using System.Configuration;
using System.Net.Http.Headers;
using ArcaneLibs.Extensions.Streams;
using ImageMagick;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Build.Globbing;
using Spacebar.AdminApi.TestClient.Services.Services;

namespace Spacebar.AdminApi.TestClient.Services.Controllers;

[ApiController]
public class IsPixelArtController(LruFileCache lfc, IFileSource fs, PixelArtDetectionService pads, DiscordImageResizeService dirs) : ControllerBase {
    private static readonly LruCache<bool> _isPixelArtCache = new(100_000);
    private static readonly LruFileCache _edgeCache = new(100_000_000);

    [HttpGet("/isPixelArt/{*_:required}")]
    public async Task<bool> IsPixelArt() {
        return await _isPixelArtCache.GetOrAddAsync(Request.Path.ToString(), async () => {
            await using var original = await fs.GetFile(Request.Path.ToString().Replace("/isPixelArt", ""));
            using var img = await original.ToMagickImageCollectionAsync();
            return pads.IsPixelArt(img);
        });
    }
    
    [HttpGet("/isCartoonArt/{*_:required}")]
    public async Task<bool> IsCartoonArt() {
        return await _isPixelArtCache.GetOrAddAsync(Request.Path.ToString(), async () => {
            await using var original = await fs.GetFile(Request.Path.ToString().Replace("/isCartoonArt", ""));
            using var img = await original.ToMagickImageCollectionAsync();
            return pads.IsCartoonArt(img);
        });
    }

    [HttpGet("/edges/{*_:required}")]
    public async Task<FileContentResult> GetEdges([FromQuery] string applyMode = "pre") {
        return await _edgeCache.GetOrAdd(Request.Path.ToString() + Request.QueryString, async () => {
            var original = await fs.GetFile(Request.Path.ToString().Replace("/edges", ""));
        
            DiscordImageResizeParams resizeParams = new() {
                Size = Request.Query.ContainsKey("size") && uint.TryParse(Request.Query["size"], out uint size) ? size : null,
                Quality = Request.Query.ContainsKey("quality") && Enum.TryParse<DiscordImageResizeQuality>(Request.Query["quality"], true, out var quality) ? quality : DiscordImageResizeQuality.High,
                KeepAspectRatio = !Request.Query.ContainsKey("keepAspectRatio") || !bool.TryParse(Request.Query["keepAspectRatio"], out bool kar) || kar,
                Passthrough = Request.Query.ContainsKey("passthrough") && bool.TryParse(Request.Query["passthrough"], out bool pt) && pt,
                Animated = Request.Query.ContainsKey("animated") && bool.TryParse(Request.Query["animated"], out bool an) && an,
                SpacebarAllowUpscale = Request.Query.ContainsKey("allowUpscale") && bool.TryParse(Request.Query["allowUpscale"], out bool au) && au,
                SpacebarOptimiseGif = Request.Query.ContainsKey("optimiseGif") && bool.TryParse(Request.Query["optimiseGif"], out bool og) && og
            };
            
            
            double radius = 1;
            if (Request.Query.ContainsKey("radius")) double.TryParse(Request.Query["radius"], out radius);

            var img = await original.ToMagickImageCollectionAsync();

            // if (applyMode == "pre") img = dirs.Apply(img,resizeParams);

            int inFrames = img.Count;
            using var edged = pads.RenderEdges(img, radius);
            // if (applyMode == "post") img = dirs.Apply(img,resizeParams);

            Console.WriteLine($"Generated edges for {Request.Path}, radius={radius}, inFrames={inFrames}, outFrames={edged.Count}");
            return new LruFileCache.Entry {
                Data = edged.ToByteArray(),
                // MimeType = Mimes.GetMime(img.First().Format),
                MimeType = "image/apng"
            };
        }).ContinueWith(t => File(t.Result.Data, t.Result.MimeType));
    }
    
        [HttpGet("/posterize/{*_:required}")]
    public async Task<FileContentResult> Posterize() {
        return await _edgeCache.GetOrAdd(Request.Path.ToString() + Request.QueryString, async () => {
            var original = await fs.GetFile(Request.Path.ToString().Replace("/posterize", ""));
            DiscordImageResizeParams resizeParams = new() {
                Size = Request.Query.ContainsKey("size") && uint.TryParse(Request.Query["size"], out uint size) ? size : null,
                Quality = Request.Query.ContainsKey("quality") && Enum.TryParse<DiscordImageResizeQuality>(Request.Query["quality"], true, out var quality) ? quality : DiscordImageResizeQuality.High,
                KeepAspectRatio = !Request.Query.ContainsKey("keepAspectRatio") || !bool.TryParse(Request.Query["keepAspectRatio"], out bool kar) || kar,
                Passthrough = Request.Query.ContainsKey("passthrough") && bool.TryParse(Request.Query["passthrough"], out bool pt) && pt,
                Animated = Request.Query.ContainsKey("animated") && bool.TryParse(Request.Query["animated"], out bool an) && an,
                SpacebarAllowUpscale = Request.Query.ContainsKey("allowUpscale") && bool.TryParse(Request.Query["allowUpscale"], out bool au) && au
            };
            
            
            double radius = 1;
            if (Request.Query.ContainsKey("radius")) double.TryParse(Request.Query["radius"], out radius);

            var img = await original.ToMagickImageCollectionAsync();


            int inFrames = img.Count;
            // using var edged = pads.RenderEdges(img, radius);
            foreach (var frame in img) {
                // get major color count
                frame.ColorFuzz = new Percentage(25);
                frame.Posterize(16, DitherMethod.No);
                frame.ColorFuzz = new Percentage(0);
            }
            
            if(resizeParams.Size.HasValue)
                img = dirs.Apply(img,resizeParams);

            Console.WriteLine($"Generated edges for {Request.Path}, radius={radius}, inFrames={inFrames}, outFrames={img.Count}");
            return new LruFileCache.Entry {
                Data = img.ToByteArray(),
                // MimeType = Mimes.GetMime(img.First().Format),
                MimeType = "image/apng"
            };
        }).ContinueWith(t => File(t.Result.Data, t.Result.MimeType));
    }
    
    [HttpGet("/colorFuzz/{*_:required}")]
    public async Task<FileContentResult> ColorFuzz() {
        return await _edgeCache.GetOrAdd(Request.Path.ToString() + Request.QueryString, async () => {
            var original = await fs.GetFile(Request.Path.ToString().Replace("/colorFuzz", ""));
            DiscordImageResizeParams resizeParams = new() {
                Size = Request.Query.ContainsKey("size") && uint.TryParse(Request.Query["size"], out uint size) ? size : null,
                Quality = Request.Query.ContainsKey("quality") && Enum.TryParse<DiscordImageResizeQuality>(Request.Query["quality"], true, out var quality) ? quality : DiscordImageResizeQuality.High,
                KeepAspectRatio = !Request.Query.ContainsKey("keepAspectRatio") || !bool.TryParse(Request.Query["keepAspectRatio"], out bool kar) || kar,
                Passthrough = Request.Query.ContainsKey("passthrough") && bool.TryParse(Request.Query["passthrough"], out bool pt) && pt,
                Animated = Request.Query.ContainsKey("animated") && bool.TryParse(Request.Query["animated"], out bool an) && an,
                SpacebarAllowUpscale = Request.Query.ContainsKey("allowUpscale") && bool.TryParse(Request.Query["allowUpscale"], out bool au) && au
            };
            
            
            double colorFuzz = 1;
            if (Request.Query.ContainsKey("colorFuzz")) double.TryParse(Request.Query["colorFuzz"], out colorFuzz);

            var img = await original.ToMagickImageCollectionAsync();


            int inFrames = img.Count;
            // using var edged = pads.RenderEdges(img, radius);
            foreach (var frame in img) {
                // get major color count
                frame.ColorFuzz = new Percentage(colorFuzz);
            }
            
            if(resizeParams.Size.HasValue)
                img = dirs.Apply(img,resizeParams);

            Console.WriteLine($"Generated colorFuzz for {Request.Path}, fuzz={colorFuzz}, inFrames={inFrames}, outFrames={img.Count}");
            return new LruFileCache.Entry {
                Data = img.ToByteArray(),
                // MimeType = Mimes.GetMime(img.First().Format),
                MimeType = "image/apng"
            };
        }).ContinueWith(t => File(t.Result.Data, t.Result.MimeType));
    }
}