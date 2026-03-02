using ArcaneLibs.Extensions.Streams;
using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.TestClient.Services.Services;
using Spacebar.Cdn.Extensions;
using Spacebar.Interop.Cdn.Abstractions;

namespace Spacebar.Cdn.Controllers;

[ApiController]
public class UserController(LruFileCache lfc, IFileSource fs, DiscordImageResizeService dirs) : ImageController {
    [HttpGet("/avatars/{userId}/{hash}.{ext}")]
    public async Task<IActionResult> GetUserAvatar(string userId, string hash, string ext) {
        var originalKey = fs.BaseUrl + Request.Path;
        var cacheKey = Request.Path + Request.QueryString;

        DiscordImageResizeParams resizeParams = GetResizeParams();

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
    [HttpGet("/banners/{userId}/{hash}.{ext}")]
    public async Task<IActionResult> GetUserBanner(string userId, string hash, string ext) {
        var originalKey = fs.BaseUrl + Request.Path;
        var cacheKey = Request.Path + Request.QueryString;

        DiscordImageResizeParams resizeParams = GetResizeParams();

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
}