using System.Text.Json.Serialization;

namespace Spacebar.AdminApi.Models;

public class AsyncActionResult {
    public AsyncActionResult() { }

    public AsyncActionResult(string type, object? data) {
        MessageType = type;
        Data = data;
    }

    [JsonPropertyName("type")]
    public string MessageType { get; set; }

    [JsonPropertyName("data")]
    public object Data { get; set; }
}