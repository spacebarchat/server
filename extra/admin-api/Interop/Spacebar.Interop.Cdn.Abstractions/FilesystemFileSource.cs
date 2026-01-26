using ArcaneLibs;

namespace Spacebar.Interop.Cdn.Abstractions;

public class FilesystemFileSource(string baseUrl) : IFileSource {
    private static LruFileCache _cache = new(100 * 1024 * 1024); // 100 MB

    private readonly StreamingHttpClient _httpClient = new() {
        BaseAddress = new Uri(baseUrl)
    };

    public string BaseUrl => baseUrl;

    public async Task<FileInfo> GetFile(string path, CancellationToken? cancellationToken = null) {
        var res = await _cache.GetOrAdd(path, async () => {
            var res = await _httpClient.SendUnhandledAsync(new(HttpMethod.Get, path), cancellationToken);
            res.EnsureSuccessStatusCode();
            var ms = new MemoryStream();
            await res.Content.CopyToAsync(ms);
            return new LruFileCache.Entry {
                Data = ms.ToArray(),
                MimeType = res.Content.Headers.ContentType?.MediaType ?? "application/octet-stream"
            };
        });

        return new() {
            Stream = new MemoryStream(res.Data),
            MimeType = res.MimeType
        };
    }

    public Task<bool> FileExists(string path, CancellationToken? cancellationToken = null) {
        return Task.FromResult(File.Exists(Path.Combine(baseUrl, path)));
    }

    // private string GetMimeType(Stream stream)
    // {
    //     using var mic = new MagickImageCollection(stream);
    //     return Mimes.GetMime(mic.First().Format);
    // }
}