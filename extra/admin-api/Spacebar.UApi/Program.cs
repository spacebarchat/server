using System.Text.Json;
using System.Text.Json.Serialization;
using ArcaneLibs;
using ArcaneLibs.Extensions;
using Microsoft.EntityFrameworkCore;
using Spacebar.ConfigModel;
using Spacebar.ConfigModel.Extensions;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.UApi.Services;

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

if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("CONFIG_PATH")))
    builder.Services.AddSingleton<Config>(sp => {
        var cfgPath = Environment.GetEnvironmentVariable("CONFIG_PATH");
        sp.GetService<ILogger<Program>>().LogInformation("Using config from path: {path}", cfgPath);
        return JsonSerializer.Deserialize<Config>(File.ReadAllText(cfgPath));
    });
else
    builder.Services.AddSingleton<Config>(sp => {
        sp.GetService<ILogger<Program>>().LogInformation("Using config from database...");
        var db = sp.GetService<SpacebarDbContext>();
        var config = db.Configs
            .OrderBy(x => x.Key)
            .ToDictionary(x => x.Key, x => x.Value);

        var readConfig = config.ToNestedJsonObject();
        return readConfig.Deserialize<Config>();
    });

builder.Services.AddSingleton<UApiConfiguration>();
builder.Services.AddSingleton<SpacebarAuthenticationConfiguration>();
builder.Services.AddScoped<SpacebarAuthenticationService>();
builder.Services.AddScoped<SpacebarAspNetAuthenticationService>();
builder.Services.AddScoped<TemplateImportService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi();
}

app.UseAuthorization();

app.MapControllers();
StreamingHttpClient.LogRequests = false;
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

// add some special sauce
app.Map("/", async context => {
    var client = new StreamingHttpClient();
    var cfg = context.RequestServices.GetService<UApiConfiguration>();
    var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), cfg.FallbackApiEndpoint);

    foreach (var header in context.Request.Headers)
        if (header.Key is not ("Accept-Encoding" or "Host"))
            requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());

    var responseMessage = await client.SendUnhandledAsync(requestMessage, CancellationToken.None);
    context.Response.StatusCode = (int)responseMessage.StatusCode;

    foreach (var header in responseMessage.Headers) context.Response.Headers[header.Key] = header.Value.ToArray();
    foreach (var header in responseMessage.Content.Headers) context.Response.Headers[header.Key] = header.Value.ToArray();

    // await responseMessage.Content.CopyToAsync(context.Response.Body);
    var txt = await responseMessage.Content.ReadAsStringAsync();
    txt = txt.Replace("your very own Spacebar instance", "your very own Spacebar instance with μAPI");
    var data = txt.AsBytes().ToArray();
    context.Response.Headers.ContentLength = data.Length;
    await context.Response.Body.WriteAsync(data);
});

// fallback to proxy in case we dont have a specific endpoint...
// TODO config
app.MapFallback("{*_}", async context => {
    var client = new StreamingHttpClient();
    var cfg = context.RequestServices.GetService<UApiConfiguration>();
    var requestMessage = new HttpRequestMessage(
        new HttpMethod(context.Request.Method),
        cfg.FallbackApiEndpoint + context.Request.Path + context.Request.QueryString
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