using ImageMagick;
using Spacebar.AdminApi.TestClient.Services;
using Spacebar.AdminApi.TestClient.Services.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSingleton<IFileSource>(new ProxyFileSource("http://cdn.old.server.spacebar.chat"));
builder.Services.AddSingleton<LruFileCache>(new LruFileCache(1*1024*1024*1024));
builder.Services.AddSingleton<PixelArtDetectionService>();
builder.Services.AddSingleton<DiscordImageResizeService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseAuthorization();

app.MapControllers();

app.Use((context, next) => {
    context.Response.Headers["Access-Control-Allow-Origin"] = "*";
    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    context.Response.Headers["Access-Control-Allow-Headers"] = "*, Authorization";
    if (context.Request.Method == "OPTIONS") {
        context.Response.StatusCode = 200;
        return Task.CompletedTask;
    }

    return next();
});

// fallback to proxy in case we dont have a specific endpoint...
app.MapFallback("{*_}",async context => {
    var client = new StreamingHttpClient();
    var requestMessage = new HttpRequestMessage(
        new HttpMethod(context.Request.Method),
        "http://cdn.old.server.spacebar.chat" + context.Request.Path + context.Request.QueryString
    ) {
        Content = new StreamContent(context.Request.Body)
    };
    Console.WriteLine(requestMessage.RequestUri);

    foreach (var header in context.Request.Headers)
        if (header.Key is not ("Accept-Encoding" or "Host"))
            requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());

    var responseMessage = await client.SendUnhandledAsync(requestMessage, CancellationToken.None);
    context.Response.StatusCode = (int)responseMessage.StatusCode;

    foreach (var header in responseMessage.Headers) context.Response.Headers[header.Key] = header.Value.ToArray();
    foreach (var header in responseMessage.Content.Headers) context.Response.Headers[header.Key] = header.Value.ToArray();

    await responseMessage.Content.CopyToAsync(context.Response.Body);
});

Console.WriteLine("Pre-initializing Magick.NET...");
MagickNET.Initialize();
StreamingHttpClient.LogRequests = false;

app.Run();