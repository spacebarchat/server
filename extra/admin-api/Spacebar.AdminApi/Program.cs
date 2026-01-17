using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http.Timeouts;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.AdminApi.Middleware;
using Spacebar.AdminApi.Services;
using Spacebar.Interop.Replication.UnixSocket;
using Spacebar.Models.Db.Contexts;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(options => {
    options.MaxValidationDepth = null;
    // options.MaxIAsyncEnumerableBufferLimit = 1;
}).AddJsonOptions(options => {
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.WriteIndented = true;
    // options.JsonSerializerOptions.DefaultBufferSize = ;
}).AddMvcOptions(o=> {
    o.SuppressOutputFormatterBuffering = true;
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddDbContextPool<SpacebarDbContext>(options => {
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("Spacebar"))
        .EnableDetailedErrors();
});
builder.Services.AddScoped<AuthenticationService>();
builder.Services.AddScoped<Configuration>();
// builder.Services.AddSingleton<RabbitMQConfiguration>();
// builder.Services.AddSingleton<RabbitMQService>();
// builder.Services.AddSingleton<ISpacebarReplication, RabbitMqSpacebarReplication>();
builder.Services.AddSingleton<ISpacebarReplication, UnixSocketSpacebarReplication>();

builder.Services.AddRequestTimeouts(x => {
    x.DefaultPolicy = new RequestTimeoutPolicy {
        Timeout = TimeSpan.FromMinutes(10),
        WriteTimeoutResponse = async context => {
            context.Response.StatusCode = 504;
            context.Response.ContentType = "application/json";
            await context.Response.StartAsync();
            await context.Response.WriteAsJsonAsync(new { error = "Unknown error" });
            await context.Response.CompleteAsync();
        }
    };
});
// builder.Services.AddCors(options => {
//     options.AddPolicy(
//         "Open",
//         policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
// });

var app = builder.Build();
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
app.UsePathBase("/_spacebar/admin");
// app.UseCors("Open");

// Configure the HTTP request pipeline.
app.MapOpenApi();

app.UseMiddleware<AuthenticationMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();