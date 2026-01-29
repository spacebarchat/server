namespace Spacebar.Interop.Cdn.Abstractions;

public interface IFileSource {
    public string BaseUrl { get; }
    public Task Init(CancellationToken? cancellationToken = null);
    public Task<FileInfo> GetFile(string path, CancellationToken? cancellationToken = null);
    public Task<bool> FileExists(string path, CancellationToken? cancellationToken = null);
    public Task WriteFile(string path, Stream stream);
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
}