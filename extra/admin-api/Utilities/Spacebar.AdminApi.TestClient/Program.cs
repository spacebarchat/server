using System.Net;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using Blazored.LocalStorage;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Spacebar.AdminApi.TestClient;
using Spacebar.AdminApi.TestClient.Services;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

try {
    builder.Configuration.AddJsonStream(await new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) }.GetStreamAsync("/appsettings.json"));
#if DEBUG
    builder.Configuration.AddJsonStream(await new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) }.GetStreamAsync("/appsettings.Development.json"));
#endif
}
catch (HttpRequestException e) {
    if (e.StatusCode == HttpStatusCode.NotFound)
        Console.WriteLine("Could not load appsettings, server returned 404.");
    else
        Console.WriteLine("Could not load appsettings: " + e);
}
catch (Exception e) {
    Console.WriteLine("Could not load appsettings: " + e);
}

builder.Logging.AddConfiguration(
    builder.Configuration.GetSection("Logging"));

builder.Services.AddBlazoredLocalStorageAsSingleton(config => {
    config.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
    config.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    config.JsonSerializerOptions.IgnoreReadOnlyProperties = true;
    config.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    config.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    config.JsonSerializerOptions.ReadCommentHandling = JsonCommentHandling.Skip;
    config.JsonSerializerOptions.WriteIndented = false;
});

// temporarily build the service provider to read config
{
    await using var sp = builder.Services.BuildServiceProvider();
    var localStorage = sp.GetRequiredService<ILocalStorageService>();
    var config = await localStorage.GetItemAsync<Config>("sb_admin_tc_config");
    if (config == null) {
        config = new Config();
        await localStorage.SetItemAsync("sb_admin_tc_config", config);
    }
    builder.Services.AddSingleton(config);
}


await builder.Build().RunAsync();