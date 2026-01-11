namespace Spacebar.AdminApi.TestClient.Services.Services;

public class LruFileCache(int maxSizeBytes) {
    private readonly Dictionary<string, Entry> _entries = new();

    public async Task<Entry?> GetOrAdd(string key, Func<Task<Entry>> factory) {
        if (_entries.TryGetValue(key, out var entry)) {
            entry.LastAccessed = DateTimeOffset.UtcNow;
            return entry;
        }

        entry = await factory();
        if (entry.Data.Length > 0)
            _entries[key] = entry;

        if (_entries.Sum(kv => kv.Value.Data.Length) > maxSizeBytes) {
            var oldestKey = _entries.OrderBy(kv => kv.Value.LastAccessed).First().Key;
            _entries.Remove(oldestKey);
        }

        return entry;
    }

    public class Entry {
        public DateTimeOffset LastAccessed { get; set; }
        public byte[] Data { get; set; }
        public string MimeType { get; set; }
    }
}

public class LruCache<T>(int maxItems) {
    private readonly Dictionary<string, CacheItem> _items = new();

    public async Task<T?> GetOrAddAsync(string key, Func<Task<T>> factory) {
        if (_items.TryGetValue(key, out var cacheItem)) {
            cacheItem.LastAccessed = DateTimeOffset.UtcNow;
            return cacheItem.Value;
        }

        var value = await factory();
        _items[key] = new CacheItem {
            Value = value,
            LastAccessed = DateTimeOffset.UtcNow
        };

        if (_items.Count > maxItems) {
            var oldestKey = _items.OrderBy(kv => kv.Value.LastAccessed).First().Key;
            _items.Remove(oldestKey);
        }

        return value;
    }

    private class CacheItem {
        public T Value { get; set; }
        public DateTimeOffset LastAccessed { get; set; }
    }
}