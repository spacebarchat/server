using ArcaneLibs.Extensions.Streams;
using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.TestClient.Services.Services;
using Spacebar.Cdn.Extensions;
using Spacebar.Cdn.Services;
using Spacebar.Interop.Cdn.Abstractions;

namespace Spacebar.Cdn.Controllers;

[ApiController]
public class ImagesAndStickerController(LruFileCache lfc, IFileSource fs, CdnWorkerService cws) : ControllerBase {
    [HttpGet("/stickers/{id}")]
    [HttpGet("/stickers/{id}.{ext}")]
    [HttpGet("/emojis/{id}")]
    [HttpGet("/emojis/{id}.{ext}")]
    public async Task<IActionResult> GetUserAvatar(string id, string ext = "webp") {
        DiscordImageResizeParams resizeParams = Request.GetResizeParams();
        var cacheKey = Request.Path + resizeParams.ToSerializedName();
        LruFileCache.Entry? entry;
        if (!Request.Query.Any() || resizeParams.Passthrough) {
            var original = await fs.GetFile(Request.Path.ToString().Replace("."+ext, ""));
            entry = new LruFileCache.Entry() {
                Data = original.Stream.ReadToEnd().ToArray(),
                MimeType = original.MimeType
            };
        }
        else
            entry = await lfc.GetOrAdd(cacheKey, async () => {
                var original = await fs.GetFile(Request.Path.ToString().Replace("."+ext, ""));
                var res = await cws.GetRawClient("q8").GetAsync("/scale" + Request.Path.ToString().Replace("."+ext, "") + Request.QueryString);
                var outStream = await res.Content.ReadAsStreamAsync();

                return new LruFileCache.Entry() {
                    Data = outStream.ReadToEnd().ToArray(),
                    MimeType = res.Content.Headers.ContentType?.ToString() ?? original.MimeType
                };
            });

        return new FileContentResult(entry.Data, entry.MimeType);
    }
}