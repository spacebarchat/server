using System.ComponentModel;
using ImageMagick;

namespace Spacebar.AdminApi.TestClient.Services;

public static class Mimes {
    private static string PrintLogged(string msg, string mime) {
        Console.WriteLine($"{msg}: {mime}");
        return mime;
    }

    public static MagickFormat GetFormatForExtension(string extension) {
        extension = extension.ToLower();
        // ban some values...
        if (extension == "screenshot") throw new AccessViolationException("Disallowed extension: " + extension);

        var matchingFormat = Enum.GetNames(typeof(MagickFormat)).FirstOrDefault(f => f.ToLower() == extension);
        if (string.IsNullOrWhiteSpace(matchingFormat)) throw new InvalidEnumArgumentException("Unknown format: " + extension);
        if (Enum.TryParse(matchingFormat, out MagickFormat fmt)) {
            return fmt;
        }

        throw new InvalidEnumArgumentException("Unknown format: " + extension);
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