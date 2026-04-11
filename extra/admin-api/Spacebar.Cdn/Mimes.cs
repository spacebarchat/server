using System.ComponentModel;
using ImageMagick;

namespace Spacebar.Cdn;

public static class Mimes {
    private static string PrintLogged(string msg, string mime) {
        Console.WriteLine($"{msg}: {mime}");
        return mime;
    }

    public static MagickFormat GetFormatForExtension(string extension) {
        extension = extension.ToLower();
        // ban some values...
        // TODO: look for more
        if (extension
            // screen capture/write
            is "screenshot"
            or "win"
            or "clipboard"
            or "x"    // read from/write to x11 server
            or "xwd"  // x11 window dump
            or "dds"  // MS DirectDraw surface
            or "open" // display image on screen, OSX only
            // printer stuff
            or "print"
            or "scan"
            or "scanx"
            // special
            or "dmr" // MagicCache media library, let's not...
            or "emf" // some microsoft meta format, windows only
            or "mpr" // Magick Persistent Registry - basically a resident in-memory image
           ) throw new AccessViolationException("Disallowed extension: " + extension);
        
        var matchingFormat = Enum.GetNames<MagickFormat>().FirstOrDefault(f => f.ToLower() == extension);
        if (string.IsNullOrWhiteSpace(matchingFormat)) throw new InvalidEnumArgumentException("Unknown format: " + extension);
        return Enum.TryParse(matchingFormat, out MagickFormat fmt) ? fmt : throw new InvalidEnumArgumentException("Unknown format: " + extension);
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