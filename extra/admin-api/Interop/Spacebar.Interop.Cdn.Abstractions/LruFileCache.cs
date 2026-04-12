using ArcaneLibs;

namespace Spacebar.Interop.Cdn.Abstractions;

public class LruFileCache(int maxSizeBytes) {
    private readonly Dictionary<string, Entry> _entries = new();

    public async Task<Entry?> GetOrAdd(string key, Func<Task<Entry>> factory) {
        lock (_entries) {
            if (_entries.TryGetValue(key, out var entry)) {
                entry.LastAccessed = DateTimeOffset.UtcNow;
                return entry;
            }
        }

        var newEntryTask = factory();
        var newEntry = await newEntryTask;
        int oldSize;
        lock (_entries)
            oldSize = _entries.Sum(kv => kv.Value.Data.Length);
        if (newEntry.Data.Length > 0 && newEntry.Data.Length <= maxSizeBytes)
            lock (_entries)
                _entries[key] = newEntry;

        lock (_entries) {
            var newSize = _entries.Sum(kv => kv.Value.Data.Length);
            if (newSize > maxSizeBytes) {
                var oldestKey = _entries.OrderBy(kv => kv.Value.LastAccessed).First().Key;
                _entries.Remove(oldestKey);
                newSize = _entries.Sum(kv => kv.Value.Data.Length);
            }

            var diffSize = newSize - oldSize;
            Console.WriteLine(
                $"LruCache: {Util.BytesToString(oldSize)} -> {Util.BytesToString(newSize)} / {Util.BytesToString(maxSizeBytes)} ({(diffSize > 0 ? "+ " : "- ") + Util.BytesToString(Math.Abs(diffSize))})");
        }

        return newEntry;
    }

    public class Entry {
        public DateTimeOffset LastAccessed { get; set; }
        public byte[] Data { get; set; }
        public string MimeType { get; set; }
    }
}

// https://cdn.old.server.spacebar.chat/emojis/1444515631118282917.webp?size=80&animated=true