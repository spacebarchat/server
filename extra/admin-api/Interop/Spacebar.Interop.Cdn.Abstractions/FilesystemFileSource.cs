using ArcaneLibs;

namespace Spacebar.Interop.Cdn.Abstractions;

public class FilesystemFileSource(string baseUrl) : IFileSource {
    private readonly StreamingHttpClient _httpClient = new() {
        BaseAddress = new Uri(baseUrl)
    };

    public string BaseUrl => baseUrl;

    public async Task Init(CancellationToken? cancellationToken = null) {
        foreach (var dir in new[] { "avatars", "banners", "icons", "stickers", "emojis" }) {
            var fullPath = Path.Join(baseUrl, dir);
            if (!Directory.Exists(fullPath))
                Directory.CreateDirectory(fullPath);
        }
    }

    public async Task<FileInfo> GetFile(string path, CancellationToken? cancellationToken = null) {
        await using var rs = File.OpenRead(Path.Join(baseUrl, path));
        var ms = new MemoryStream();
        await rs.CopyToAsync(ms);
        return new() {
            Stream = ms,
            MimeType = "MIME/TYPE"
        };
    }

    public Task<bool> FileExists(string path, CancellationToken? cancellationToken = null) {
        return Task.FromResult(File.Exists(Path.Join(baseUrl, path)));
    }

    public async Task WriteFile(string path, Stream stream) {
        var fullPath = Path.Join(baseUrl, path);
        // Console.WriteLine($"Writing file to {fullPath}... ");
        if (!Directory.Exists(Path.GetDirectoryName(fullPath)!))
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using var fs = File.Create(fullPath);
        await stream.CopyToAsync(fs);
    }

    // private string GetMimeType(Stream stream)
    // {
    //     using var mic = new MagickImageCollection(stream);
    //     return Mimes.GetMime(mic.First().Format);
    // }
    public Task<bool> DirectoryExists(string path) {
        return Task.FromResult(Directory.Exists(Path.Join(baseUrl, path)));
    }
}