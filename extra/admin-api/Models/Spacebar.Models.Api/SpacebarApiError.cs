using System.Text.Json;
using System.Text.Json.Nodes;

namespace Spacebar.Models.Api;

public class SpacebarApiException : Exception {
    public int Code { get; set; }
    
    public string ErrorMessage { get; set; }

    public string? Request { get; set; } // Spacebar extension

    // public Dictionary<string, FieldErrorList> Errors { get; set; }
    public JsonObject? Errors { get; set; }
    
    public JsonObject?[]? AjvErrors { get; set; }

    public class FieldErrorList {
        // public 
    }

    public SpacebarApiException(string? message) : base(message) { }

    // TODO: abstract out to HTTP layer
    public static SpacebarApiException FromJson(JsonObject resp) {
        var msg = resp["code"]!.GetValue<int>() + " " +  resp["message"]!.GetValue<string>();

        if (resp.ContainsKey("_ajvErrors") && resp["_ajvErrors"]!.AsArray().Any()) {
            msg = msg + " " + resp["_ajvErrors"]!.ToJsonString(new() { WriteIndented = true });
        } else if (resp.ContainsKey("errors") && resp["errors"]!.AsObject().Any()) {
            msg = msg + " " + resp["errors"]!.ToJsonString(new() { WriteIndented = true });
        }
        
        var ex = new SpacebarApiException(msg) {
            Code = resp["code"]!.GetValue<int>(),
            ErrorMessage = resp["message"]!.GetValue<string>(),
            Request = resp["request"]?.GetValue<string>(),
            Errors = resp["errors"]?.AsObject(),
            AjvErrors = resp["_ajvErrors"]?.Deserialize<JsonObject?[]>(),
        };

        return ex;
    }

    public JsonObject AsJsonObject() => new() {
        { "message", Message },
        { "code", Code },
        { "request", Request },
        { "errors", Errors }
    };
}