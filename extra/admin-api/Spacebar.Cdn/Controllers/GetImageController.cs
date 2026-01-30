using ArcaneLibs.Extensions.Streams;
using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.TestClient.Services.Services;
using Spacebar.Cdn.Extensions;
using Spacebar.Interop.Cdn.Abstractions;

namespace Spacebar.Cdn.Controllers;

[ApiController]
public class GetImageController(LruFileCache lfc, IFileSource fs, DiscordImageResizeService dirs) : ControllerBase {
    [HttpGet("/avatars/{_:required}")]
    [HttpGet("/emojis/{emoji_id:required}.{ext:required}")]
    [HttpGet("/stickers/{sticker_id:required}.{ext:required}")]
    [HttpGet("/avatars/{user_id:required}/{avatar_hash:required}.{ext:required}")]
    [HttpGet("/banners/{user_id:required}/{user_banner:required}.{ext:required}")]
    public async Task<IActionResult> GetImage(string? ext) {
        var originalKey = fs.BaseUrl + Request.Path;
        var cacheKey = Request.Path + Request.QueryString;
        
        DiscordImageResizeParams resizeParams = new() {
            Size = Request.Query.ContainsKey("size") && uint.TryParse(Request.Query["size"], out uint size) ? size : null,
            Quality = Request.Query.ContainsKey("quality") && Enum.TryParse<DiscordImageResizeQuality>(Request.Query["quality"], true, out var quality) ? quality : DiscordImageResizeQuality.High,
            KeepAspectRatio = !Request.Query.ContainsKey("keepAspectRatio") || !bool.TryParse(Request.Query["keepAspectRatio"], out bool kar) || kar,
            Passthrough = Request.Query.ContainsKey("passthrough") && bool.TryParse(Request.Query["passthrough"], out bool pt) && pt,
            Animated = Request.Query.ContainsKey("animated") && bool.TryParse(Request.Query["animated"], out bool an) && an,
            SpacebarAllowUpscale = Request.Query.ContainsKey("allowUpscale") && bool.TryParse(Request.Query["allowUpscale"], out bool au) && au,
            SpacebarOptimiseGif = Request.Query.ContainsKey("optimiseGif") && bool.TryParse(Request.Query["optimiseGif"], out bool og) && og
        };

        var entry = await lfc.GetOrAdd(cacheKey, async () => {
            var original = await fs.GetFile(Request.Path);

            if (Request.Query.Any()) {
                using var img = await original.ToMagickImageCollectionAsync();
                dirs.Apply(img, resizeParams);
                
                var outStream = new MemoryStream();
                await img.WriteAsync(outStream, img.First().Format);
                outStream.Position = 0;

                return new LruFileCache.Entry() {
                    Data = outStream.ReadToEnd().ToArray(),
                    MimeType = original.MimeType
                };
            }

            return new LruFileCache.Entry() {
                Data = original.Stream.ReadToEnd().ToArray(),
                MimeType = original.MimeType
            };
        });

        // byte array with mime type result
        return new FileContentResult(entry.Data, entry.MimeType);
    }

    // TODO: is message_id required? Can't tell from discord.food: /attachments/{channel_id}/[{message_id]/attachment_id}/{attachment_filename}
    [HttpGet("/attachments/{channel_id:required}/{message_id:required}/{attachment_id:required}/{filename:required}")]
    [HttpGet("/ephemeral-attachments/{application_id:required}/{attachment_id:required}/{attachment_filename:required}")]
    public async Task<IActionResult> GetAttachmentImage() {
        // TODO: url signing, file type checks
        return await GetImage("");
    }
}