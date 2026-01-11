using ImageMagick;

namespace Spacebar.AdminApi.TestClient.Services.Services;

public interface IFileSource {
    public string BaseUrl { get; }
    public Task<FileInfo> GetFile(string path, CancellationToken? cancellationToken = null);
}

public class FileInfo : IDisposable, IAsyncDisposable {
    public string MimeType { get; set; }
    public Stream Stream { get; set; }
    
    protected virtual void Dispose(bool disposing) {
        if (disposing) {
            Stream.Dispose();
        }
    }

    public void Dispose() {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual async ValueTask DisposeAsyncCore() => await Stream.DisposeAsync();

    public async ValueTask DisposeAsync() {
        await DisposeAsyncCore();
        GC.SuppressFinalize(this);
    }
    
    public async Task<MagickImageCollection> ToMagickImageCollectionAsync() {
        var ms = new MemoryStream();
        Stream.Position = 0;
        await Stream.CopyToAsync(ms);
        ms.Position = 0;
        var img = MimeType switch {
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