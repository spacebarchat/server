using System.Text.Json.Nodes;

namespace Spacebar.Models.Api;

public class SpacebarApiException : Exception {
    public int Code { get; set; }
    public string? Request { get; set; } // Spacebar extension
    // public Dictionary<string, FieldErrorList> Errors { get; set; }
    public JsonObject? Errors { get; set; }

    public class FieldErrorList {
        // public 
    }

    public SpacebarApiException(string? message) : base(message) {
        
    }

    // TODO: abstract out to HTTP layer
    public static SpacebarApiException FromJson(JsonObject resp) {
        var ex = new SpacebarApiException(resp["message"]!.GetValue<string>()) {
            Code = resp["code"]!.GetValue<int>(),
            Request = resp["request"]?.GetValue<string>(),
            Errors = resp["errors"]?.AsObject()
        };

        return ex;
    }
}