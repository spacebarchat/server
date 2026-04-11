namespace Spacebar.Interop.Cdn.Abstractions;

public class FilesystemFileSource(string baseUrl) : IFileSource {
    public string BaseUrl => baseUrl;

    private string GetPathSafe(string path) {
        var p = Path.Join(baseUrl, path);
        if (!p.StartsWith(baseUrl)) throw new UnauthorizedAccessException("Invalid path: " + p);
        Console.WriteLine($"Resolved \"safe\" path: {p}");
        return p;
    }
    
    public async Task<IFileSource> Init(CancellationToken? cancellationToken = null) {
        foreach (var dir in new[] { "avatars", "banners", "icons", "stickers", "emojis" }) {
            var fullPath = Path.Join(baseUrl, dir);
            if (!Directory.Exists(fullPath))
                Directory.CreateDirectory(fullPath);
        }

        return this;
    }

    public async Task<FileInfo> GetFile(string path, CancellationToken? cancellationToken = null) {
        await using var rs = File.OpenRead(GetPathSafe(path));
        var ms = new MemoryStream();
        await rs.CopyToAsync(ms);
        return new() {
            Stream = ms,
            MimeType = "MIME/TYPE"
        };
    }

    public Task<bool> FileExists(string path, CancellationToken? cancellationToken = null) {
        return Task.FromResult(File.Exists(GetPathSafe(path)));
    }

    public async Task WriteFile(string path, Stream stream) {
        var fullPath = GetPathSafe(path);
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
        return Task.FromResult(Directory.Exists(GetPathSafe(path)));
    }
}