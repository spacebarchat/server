using ImageMagick;

namespace Spacebar.AdminApi.TestClient.Services;

public static class Mimes {
    private static string PrintLogged(string msg, string mime) {
        Console.WriteLine($"{msg}: {mime}");
        return mime;
    }

    public static string GetMime(MagickFormat fmt) => fmt switch {
        MagickFormat.Png => "image/png",
        MagickFormat.Jpeg => "image/jpeg",
        MagickFormat.Gif => "image/gif",
        MagickFormat.Bmp => "image/bmp",
        MagickFormat.Tiff => "image/tiff",
        MagickFormat.WebP => "image/webp",
        _ => PrintLogged("Unknown mime for format " + fmt.ToString() + "!", "application/octet-stream")
    };
}