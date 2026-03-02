using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using ArcaneLibs;
using Microsoft.AspNetCore.Mvc;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.UApi.Services;

namespace Spacebar.UApi.Controllers.Messages;

[ApiController]
[Route("/api/v{_}/channels/{channelId}/messages")]
public partial class MessagesController(ILogger<MessagesController> logger, SpacebarDbContext db, SpacebarAspNetAuthenticationService authService, UApiConfiguration cfg) : ControllerBase {
    // [Consumes("multipart/form-data")]
    // [HttpPost]
    // public async Task CreateMessageWithAttachments(string channelId, MultipartFormDataContent formData) {
    //     // Generic proxy doesnt work with multipart/form-data for some reason, so handle them specially
    //     JsonObject jsonPayload = null!;
    //     
    //     foreach (var content in formData)
    //     {
    //         if (content.Headers.ContentDisposition?.Name == "payload_json") {
    //             jsonPayload = await content.ReadFromJsonAsync<JsonObject>();
    //             break;
    //         }
    //         if (FileNameRegex().IsMatch(content.Headers.ContentDisposition?.Name ?? "")) {
    //             
    //             break;
    //         }
    //         throw new InvalidOperationException("Invalid multipart/form-data payload: missing payload_json or file attachments");
    //     }
    //     
    //     var client = new StreamingHttpClient();
    //     var requestMessage = new HttpRequestMessage(
    //         new HttpMethod(Request.Method),
    //         cfg.FallbackApiEndpoint + Request.Path + Request.QueryString
    //     ) {
    //         Content = new StreamContent(Request.Body)
    //     };
    //     Console.WriteLine(requestMessage.RequestUri);
    //
    //     var responseMessage = await client.SendUnhandledAsync(requestMessage, CancellationToken.None);
    //     Response.StatusCode = (int)responseMessage.StatusCode;
    //
    //     foreach (var header in responseMessage.Headers) Response.Headers[header.Key] = header.Value.ToArray();
    //     foreach (var header in responseMessage.Content.Headers) Response.Headers[header.Key] = header.Value.ToArray();
    //
    //     await responseMessage.Content.CopyToAsync(Response.Body);
    // }
    
    [GeneratedRegex(@"files\[\d+\]")]
    private static partial Regex FileNameRegex();

    private struct CloudUploadTask {
        public int index;
        public Task<string> task;
    }
}