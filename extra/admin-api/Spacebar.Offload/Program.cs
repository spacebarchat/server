using System.Diagnostics.Metrics;
using System.Text.Json;
using System.Text.Json.Serialization;
using ArcaneLibs.Extensions;
using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Generic;

var builder = WebApplication.CreateBuilder(args);
if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("APPSETTINGS_PATH")))
    builder.Configuration.AddJsonFile(Environment.GetEnvironmentVariable("APPSETTINGS_PATH")!);

// Add services to the container.
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource=> {
        resource.AddService(serviceName: builder.Environment.ApplicationName, serviceNamespace: builder.Environment.ApplicationName);
    })
    .WithMetrics(builder =>
    {
        builder.AddPrometheusExporter();
        
        builder.AddMeter("Microsoft.AspNetCore.Hosting", "Microsoft.AspNetCore.Server.Kestrel", "System.Runtime", "Microsoft.Extensions.Diagnostics.ResourceMonitoring", "Microsoft.AspNetCore.Routing", "Microsoft.AspNetCore.Diagnostics", "Microsoft.AspNetCore.RateLimiting", "Microsoft.AspNetCore.HeaderParsing", "Microsoft.AspNetCore.Server.Kestrel");
        builder.AddView("http.server.request.duration",
            new ExplicitBucketHistogramConfiguration
            {
                Boundaries = [0.0, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 10]
            });
    });

builder.Services.AddControllers(options =>
{
    options.MaxValidationDepth = null;
    // options.MaxIAsyncEnumerableBufferLimit = 1;
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
    options.JsonSerializerOptions.WriteIndented = true;
    options.JsonSerializerOptions.MaxDepth = 100;
    // options.JsonSerializerOptions.DefaultBufferSize = ;
}).AddMvcOptions(o => { o.SuppressOutputFormatterBuffering = true; });
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContextPool<SpacebarDbContext>(options =>
{
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});

builder.Services.AddSingleton<SpacebarAuthenticationConfiguration>();
builder.Services.AddScoped<SpacebarAuthenticationService>();
builder.Services.AddScoped<SpacebarAspNetAuthenticationService>();

var app = builder.Build();

app.MapPrometheusScrapingEndpoint();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();

app.MapControllers();

app.Run();