using ImageMagick;
using FileInfo = Spacebar.Interop.Cdn.Abstractions.FileInfo;

namespace Spacebar.Cdn.Extensions;

public static class FileSourceExtensions {
    public static async Task<MagickImageCollection> ToMagickImageCollectionAsync(this FileInfo fileInfo) {
        var ms = new MemoryStream();
        fileInfo.Stream.Position = 0;
        await fileInfo.Stream.CopyToAsync(ms);
        ms.Position = 0;
        var img = fileInfo.MimeType switch {
            "image/apng" => new MagickImageCollection(ms, MagickFormat.APng),
            _ => new MagickImageCollection(ms)
        };
        
        // if (img.First().Format == MagickFormat.Png) {
        // img.Dispose();
        // ms.Position = 0;
        // img = new MagickImageCollection(ms, MagickFormat.APng);
        // }

        return img;
    }
}