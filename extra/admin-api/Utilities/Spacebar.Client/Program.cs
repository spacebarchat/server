using ArcaneLibs.Blazor.Components.Services;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Spacebar.Client;
using Spacebar.Client.WebCore;
using Spacebar.Sdk.Core;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
builder.Services.AddSingleton<LocalStorageService>();
builder.Services.AddSingleton<JsConsoleService>();
builder.Services.AddSingleton<SessionStore>();
builder.Services.AddSingleton<SpacebarClientProviderService>();
builder.Services.AddSingleton<SpacebarClientWellKnownResolverService>();

await builder.Build().RunAsync();