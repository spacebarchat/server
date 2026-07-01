using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using ArcaneLibs.Extensions;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Internal;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class GuildEmojiTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client { get; set; } = null!;
    private static Guild? Guild { get; set; }

    private const string Base64ImageData =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAIAAABMXPacAAAAAXNSR0IB2cksfwAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAA8hJREFUeNrtnD9oE1EYwL8XOxwIphksdIjQoUNQB41TumVrpoJLwUUI2EEpQltwyOaN7SI4KHRwELqomeLmZqdWBwMdKgjNUMmS1qnbuahoTXq5u/fu3r38fputzd19v/e97/27KFFXBbKjQAgQgABAAAIAAQgABCAAEIAAQAACAAEIAAQgABCAAEAAAgABCAAEIAAQgABAAAIAAQiA5Eylcxnl9//+Z/BmVT7vWBUI1WzLXO2fm2zNpHFd4y9oeEXVOhz6m3SeMEb7SPMOjQsY9Wy/GPSCraqFoU/NQcF4Xl9Mqaz8vkxfyyD0tZXQ6IvIuX4pZxkw1hNm0SPZc2NTYg3K78tBJ3h93+xVWl/Fu8IwdASVRqS2GY3Zm8rvWxV9wxlQaSTpH/QmvkGvybgk6rKpZH/8MdGf1zeUiHzbTT4QUHefJfqI6bIcvM9fEdbV6OKnwugpSHr3kKMirLdHsrbPsbsIXxzQ8aYLqr6Rl+gbzAB175X+z1zfC00FU6H3inJ2mqcaYLYNDlvAMHvFs9PAn5/oLmjIAoZX/L1asGC8z/lzrQkswqPntIeSfwr5ai/uYWQipp50ZcpzLVSDnnzvkgHZ9XgJp9NOFWGHQIB7Am4vE9Ysi7B6+MHZaM1ely9t6zPAXVTcHQ4EUIQhHQEmFkHtYrpsdwZUFh0vA480DzFsWYwLNqty0gv5T6WyWtsP/6hx9s4qizGTVfckX/N+QIxl4aDTkt2XUcaCN0aNdCNvW67vxTiUp3d/WGsXVIp+wnBwFC36InLcHXpUItisRk+7O04VYbW2FzkEW3FCEGwvDflpaA+mqznXHjAMzbQON3wE/N+V9XJ642SAMwJqK0QzSwGq8XSCykDzHV1QpswtIIAuCOwREP4ynntoWhbVlAGGXyW0sQ6v79skACZdQKmMAMihgHgnnIfX/Fh1KPN3abLOAK+o6hvRQnZreWisVbMddbtKVyFN1AS17Iglb0fB9lL4G6lzC+OsAQT+fPjrRLWV5GsnWrbGbBGQR7QIoAgzCspp8++0LBJgz3dfpUfUswRkgJ3oO57uFVW5OiFRCzarcvbDsgzQ1CfmgxNtZwB0dkHB8zqjz0xrwHHX/fAPjqwehjo/HIp3lC/VUZDDDkw8WiEvN+pk9A3OA4LWjJwcORL63RfmmlTWX108qQ0/PQH51eDKt6efo9lWFh+hCD7tyNvVNK+YugBIpwgDAhAACEAAIAABgAAEAAIQAAhAACAAAYAABAACEAAIQAACCAECEAAIQAAgAAGAAAQAAiaKn3vk4S2WTtVqAAAAAElFTkSuQmCC";

    public async ValueTask InitializeAsync() {
        testOutputHelper.WriteLine("Running InitializeAsync");
        // All these tests can share a single client
        Client = await _userAbstraction.GetSharedUser();
        // ...and a guild
        Guild ??= await Client.CreateGuild(new() {
            Name = "Test guild"
        });
    }

    [Fact]
    public async Task GetEmojis() {
        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.GetAsync($"/api/v9/guilds/{Guild.Id}/emojis", TestContext.Current.CancellationToken));
        var resEmojis = await res.Content.ReadFromJsonAsync<JsonArray>();

        resEmojis!.ForEach(eJson => {
            Assert.StringNotNullOrWhitespace(eJson?["id"]?.GetValue<string>());
            Assert.StringNotNullOrWhitespace(eJson?["name"]?.GetValue<string>());
        });
    }

    [Fact]
    public async Task UploadEmoji() {
        var reqJson = new JsonObject() {
            { "name", "meow" },
            { "image", Base64ImageData }
        };

        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"/api/v9/guilds/{Guild.Id}/emojis", reqJson, TestContext.Current.CancellationToken));
        var resEmoji = await res.Content.ReadFromJsonAsync<JsonObject>();

        Assert.StringNotNullOrWhitespace(resEmoji?["id"]?.GetValue<string>());
        Assert.StringNotNullOrWhitespace(resEmoji?["name"]?.GetValue<string>());
        Assert.Equal("meow", resEmoji?["name"]?.GetValue<string>());
    }

    [Fact]
    public async Task UpdateEmoji() {
        var reqJson = new JsonObject() {
            { "name", "meow" },
            { "image", Base64ImageData }
        };

        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"/api/v9/guilds/{Guild.Id}/emojis", reqJson, TestContext.Current.CancellationToken));
        var resEmoji = await res.Content.ReadFromJsonAsync<JsonObject>();

        Assert.StringNotNullOrWhitespace(resEmoji?["id"]?.GetValue<string>());
        Assert.StringNotNullOrWhitespace(resEmoji?["name"]?.GetValue<string>());
        Assert.Equal("meow", resEmoji?["name"]?.GetValue<string>());

        var reqJson2 = new JsonObject() {
            { "name", "meowtwo" }
        };
        var res2 = await Assert.HttpSuccess(await Client.ApiHttpClient.PatchAsJsonAsync($"/api/v9/guilds/{Guild.Id}/emojis/{resEmoji?["id"]?.GetValue<string>()}", reqJson2,
            TestContext.Current.CancellationToken));
        var resEmoji2 = await res2.Content.ReadFromJsonAsync<JsonObject>();

        Assert.StringNotNullOrWhitespace(resEmoji2?["id"]?.GetValue<string>());
        Assert.StringNotNullOrWhitespace(resEmoji2?["name"]?.GetValue<string>());
        Assert.Equal("meowtwo", resEmoji2?["name"]?.GetValue<string>());
    }

    [Fact]
    public async Task DeleteEmoji() {
        var reqJson = new JsonObject() {
            { "name", "meow" },
            { "image", Base64ImageData }
        };

        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"/api/v9/guilds/{Guild.Id}/emojis", reqJson, TestContext.Current.CancellationToken));
        var resEmoji = await res.Content.ReadFromJsonAsync<JsonObject>();

        Assert.StringNotNullOrWhitespace(resEmoji?["id"]?.GetValue<string>());
        Assert.StringNotNullOrWhitespace(resEmoji?["name"]?.GetValue<string>());
        Assert.Equal("meow", resEmoji?["name"]?.GetValue<string>());

        await Assert.HttpSuccess(await Client.ApiHttpClient.DeleteAsync($"/api/v9/guilds/{Guild.Id}/emojis/{resEmoji?["id"]?.GetValue<string>()}",
            TestContext.Current.CancellationToken));
    }
    
    [Fact]
    public async Task GetEmojiSource() {
        var reqJson = new JsonObject() {
            { "name", "meow" },
            { "image", Base64ImageData }
        };

        var res = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"/api/v9/guilds/{Guild.Id}/emojis", reqJson, TestContext.Current.CancellationToken));
        var resEmoji = await res.Content.ReadFromJsonAsync<JsonObject>();

        Assert.StringNotNullOrWhitespace(resEmoji?["id"]?.GetValue<string>());
        Assert.StringNotNullOrWhitespace(resEmoji?["name"]?.GetValue<string>());
        Assert.Equal("meow", resEmoji?["name"]?.GetValue<string>());

        var sourceRes = await Assert.HttpSuccess(await Client.ApiHttpClient.GetAsync($"/api/v9/emojis/{resEmoji?["id"]?.GetValue<string>()}/source",
            TestContext.Current.CancellationToken));
        var sourceResJson = await sourceRes.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: TestContext.Current.CancellationToken);
        
        Assert.StringNotNullOrWhitespace(sourceResJson?["type"]?.GetValue<string>());
        Assert.Equal("GUILD", sourceResJson?["type"]?.GetValue<string>());
        
        Assert.StringNotNullOrWhitespace(sourceResJson?["guild"]?.AsObject()["id"]?.GetValue<string>());
        Assert.Equal(Guild.Id.ToString(), sourceResJson?["guild"]?.AsObject()["id"]?.GetValue<string>());
    }
}