using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Spacebar.Interop.Cdn.Abstractions;

public class LruFileCache(int maxSizeBytes) {
    private readonly Dictionary<string, Entry> _entries = new();

    public async Task<Entry?> GetOrAdd(string key, Func<Task<Entry>> factory) {
        if (_entries.TryGetValue(key, out var entry)) {
            entry.LastAccessed = DateTimeOffset.UtcNow;
            return entry;
        }

        entry = await factory();
        if (entry.Data.Length > 0 && entry.Data.Length <= maxSizeBytes)
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

