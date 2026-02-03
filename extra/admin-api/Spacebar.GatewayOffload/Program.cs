using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers(options => {
    options.MaxValidationDepth = null;
    // options.MaxIAsyncEnumerableBufferLimit = 1;
}).AddJsonOptions(options => {
    // options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.WriteIndented = true;
    options.JsonSerializerOptions.MaxDepth = 100;
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

app.Run();