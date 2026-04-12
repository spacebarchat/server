using ArcaneLibs.Extensions.Streams;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi;
using Spacebar.AdminApi.TestClient.Services.Services;
using Spacebar.Cdn.Extensions;
using Spacebar.Cdn.Services;
using Spacebar.Interop.Cdn.Abstractions;

namespace Spacebar.Cdn.Controllers;

[ApiController]
public class StaticAssetController(LruFileCache lfc, IFileSource fs, CdnWorkerService cws) : ControllerBase {
    [HttpGet("/embed/avatars/{avatarIdx}")]
    [HttpGet("/embed/avatars/{avatarIdx}.{ext}")]
    public async Task<IActionResult> GetUserAvatar(string avatarIdx, string ext = "webp") {
        DiscordImageResizeParams resizeParams = Request.GetResizeParams();
        var cacheKey = Request.Path + resizeParams.ToSerializedName();
        LruFileCache.Entry? entry;
            entry = await lfc.GetOrAdd(cacheKey, async () => {
                
                var res = await cws.GetRawClient("q8").GetAsync(Request.Path + Request.QueryString);
                var outStream = await res.Content.ReadAsStreamAsync();

                return new LruFileCache.Entry() {
                    Data = outStream.ReadToEnd().ToArray(),
                    MimeType = res.Content.Headers.ContentType?.ToString() ?? Mimes.GetMime(Mimes.GetFormatForExtension(ext))
                };
            });

        return new FileContentResult(entry.Data, entry.MimeType);
    }
}