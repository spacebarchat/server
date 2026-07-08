using System.Net.Http.Json;
using System.Text.Json.Nodes;

namespace Spacebar.Tests.Extensions;

public static class AssertHttpExtensions {
    private static readonly HttpClient Hc = new();

    public static async Task<string> GetFormattedErrorDetails(HttpResponseMessage res) {
        return res.Content.Headers.ContentType?.MediaType == "application/json"
            ? (await res.Content.ReadFromJsonAsync<JsonObject>())!.ToJsonString(new() {
                WriteIndented = true
            })
            : await res.Content.ReadAsStringAsync();
    }

    extension(Assert) {
        public static async Task<HttpResponseMessage> SuccessfullyHttpGetAsync(string url) {
            var res = await Hc.GetAsync(url);
            Assert.True(res.IsSuccessStatusCode, $"Could not get {url}: {res.StatusCode}\n{await GetFormattedErrorDetails(res)}");
            return res;
        }

        public static async Task<HttpResponseMessage> SuccessfullyHttpPostAsJsonAsync<TValue>(string url, TValue obj) {
            var res = await Hc.PostAsJsonAsync(url, obj);
            if (!res.IsSuccessStatusCode)
                Assert.True(res.IsSuccessStatusCode, $"Could not POST JSON to {url}: {(int)res.StatusCode} {res.StatusCode}\n{await GetFormattedErrorDetails(res)}");
            return res;
        }

        public static async Task<HttpResponseMessage> SuccessfullyHttpDeleteAsync(string url) {
            var res = await Hc.DeleteAsync(url);
            if (!res.IsSuccessStatusCode)
                Assert.True(res.IsSuccessStatusCode, $"Could not DELETE {url}: {(int)res.StatusCode} {res.StatusCode}\n{await GetFormattedErrorDetails(res)}");
            return res;
        }

        public static async Task<HttpResponseMessage> HttpSuccess(HttpResponseMessage res) {
            if (!res.IsSuccessStatusCode)
                Assert.True(res.IsSuccessStatusCode,
                    $"Could not {res.RequestMessage!.Method.Method.ToUpper()} to {res.RequestMessage!.RequestUri!.ToString()}: {(int)res.StatusCode} {res.StatusCode}\n{await GetFormattedErrorDetails(res)}");
            return res;
        }
    }
}