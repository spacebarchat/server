using ArcaneLibs.Extensions.Streams;
using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.TestClient.Services.Services;
using Spacebar.Cdn.Services;
using Spacebar.Interop.Cdn.Abstractions;

namespace Spacebar.Cdn.Extensions;

[ApiController]
public class ImageController(LruFileCache lfc, IFileSource fs, CdnWorkerService cws) : ControllerBase {
    protected async Task<IActionResult> GetImage(string path) {
        DiscordImageResizeParams resizeParams = Request.GetResizeParams();
        var cacheKey = path + resizeParams.ToSerializedName();
        if (!Request.Query.Any() || resizeParams.Passthrough) {
            await using var original = await fs.GetFile(path);
            return new FileContentResult(original.Stream.ReadToEnd().ToArray(), original.MimeType);
        }

        var entry = await lfc.GetOrAdd(cacheKey, async () => {
            var original = await fs.GetFile(path);
            var res = await cws.GetRawClient("q8").GetAsync("/scale" + path + Request.QueryString);
            var outStream = await res.Content.ReadAsStreamAsync();

            return new LruFileCache.Entry() {
                Data = outStream.ReadToEnd().ToArray(),
                MimeType = res.Content.Headers.ContentType?.ToString() ?? original.MimeType
            };
        });

        // byte array with mime type result
        return new FileContentResult(entry.Data, entry.MimeType);
    }
}