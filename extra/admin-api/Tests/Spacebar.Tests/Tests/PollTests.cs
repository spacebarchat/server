using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class PollTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client = null!;
    private static SpacebarClientGuild? Guild;
    private static SpacebarClientChannel? Channel = null!;

    public async ValueTask InitializeAsync() {
        Client = await _userAbstraction.GetSharedUser();

        if (Guild is null)
            await Client.CreateGuild(new() {
                Name = "Test guild"
            }).ContinueWith(g => {
                Assert.Equal("Test guild", g.Result.Name);
                Guild = Client.GetGuild(g.Result.Id);
            });

        if (Channel is null)
            await Guild!.CreateChannelAsync(new() {
                Name = "test",
                Type = 0
            }).ContinueWith(c => {
                Assert.Equal("test", c.Result.Name);
                Channel = Client.GetChannel(c.Result.Id);
            });
    }

    [Fact]
    public async Task SendMessage() {
        await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync($"channels/{Channel.Id}/messages",
            JsonSerializer.Deserialize<JsonObject>(
                """
                {
                  "mobile_network_type": "unknown",
                  "content": "",
                  "nonce": "1520116766829707264",
                  "tts": false,
                  "flags": 0,
                  "poll": {
                    "question": {
                      "text": "meow"
                    },
                    "answers": [
                      {
                        "poll_media": {
                          "text": "meowmeow"
                        }
                      },
                      {
                        "poll_media": {
                          "text": "meowmeowmeow",
                          "emoji": {
                            "name": "😭"
                          }
                        }
                      }
                    ],
                    "allow_multiselect": false,
                    "duration": 24,
                    "layout_type": 1
                  }
                }
                """),
            cancellationToken: TestContext.Current.CancellationToken));
    }
}