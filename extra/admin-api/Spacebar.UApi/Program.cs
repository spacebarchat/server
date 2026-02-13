using System.Text.Json.Serialization;
using ArcaneLibs;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;

var builder = WebApplication.CreateBuilder(args);
if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("APPSETTINGS_PATH")))
    builder.Configuration.AddJsonFile(Environment.GetEnvironmentVariable("APPSETTINGS_PATH")!);

// Add services to the container.

builder.Services.AddControllers(options => {
    options.MaxValidationDepth = null;
    // options.MaxIAsyncEnumerableBufferLimit = 1;
}).AddJsonOptions(options => {
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.WriteIndented = true;
    options.JsonSerializerOptions.MaxDepth = 100;
    // options.JsonSerializerOptions.DefaultBufferSize = ;
}).AddMvcOptions(o => { o.SuppressOutputFormatterBuffering = true; });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContextPool<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});

builder.Services.AddSingleton<SpacebarAuthenticationConfiguration>();
builder.Services.AddScoped<SpacebarAuthenticationService>();
builder.Services.AddScoped<SpacebarAspNetAuthenticationService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}

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
// TODO config
app.MapFallback("{*_}", async context => {
    var client = new StreamingHttpClient();
    var requestMessage = new HttpRequestMessage(
        new HttpMethod(context.Request.Method),
        "http://api.old.server.spacebar.chat" + context.Request.Path + context.Request.QueryString
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

app.Run();