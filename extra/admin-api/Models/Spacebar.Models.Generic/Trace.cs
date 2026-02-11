using System.Diagnostics;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace Spacebar.Models.Generic;

public class Trace {
    [JsonPropertyName("micros")]
    public long Micros { get; set; }

    [JsonIgnore]
    public string? Name { get; set; }

    [JsonIgnore]
    public List<Trace>? Calls { get; set; }

    [JsonPropertyName("calls")]
    // zipped array of [string, Trace]
    public JsonArray? ZippedCalls {
        get {
            if (Calls == null) return null;
            var arr = new JsonArray();
            foreach (var t in Calls) {
                arr.Add(t.Name);
                arr.Add(t);
            }

            return arr;
        }
    }

    public JsonArray AsRoot() {
        return new() {
            Name,
            this
        };
    }
}

public static class TraceResult {
    public static async Task<TraceResult<T>> TraceAsync<T>(string name, Func<Task<T>> func) {
        var sw = Stopwatch.StartNew();
        var result = await func();
        sw.Stop();
        return new TraceResult<T> {
            Name = name,
            Micros = sw.Elapsed.Microseconds,
            Result = result
        };
    }

    public static async Task<TraceResult<T>> Trace<T>(string name, Func<T> func) {
        var sw = Stopwatch.StartNew();
        var result = func();
        sw.Stop();
        return new TraceResult<T> {
            Name = name,
            Micros = sw.Elapsed.Microseconds,
            Result = result
        };
    }
}

public class TraceResult<T> : Trace {
    [JsonIgnore]
    public T Result { get; set; }
}