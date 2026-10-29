using System.Net.Http.Json;
using System.Text.Json;
using ArcaneLibs.Extensions;
using Spacebar.Models.Api;
using Spacebar.Models.Generic;
using Spacebar.Sdk.Core;
using Spacebar.Tests.Abstractions;
using Spacebar.Tests.Extensions;
using Spacebar.Tests.Fixtures;
using Xunit.Internal;
using Xunit.Microsoft.DependencyInjection.Abstracts;

namespace Spacebar.Tests.Tests;

public class AutomodTests(ITestOutputHelper testOutputHelper, TestFixture fixture) : TestBed<TestFixture>(testOutputHelper, fixture), IAsyncLifetime {
    private readonly Config _config = fixture.GetRequiredService<Config>(testOutputHelper);
    private readonly SpacebarClientWellKnownResolverService _wellKnownResolver = fixture.GetRequiredService<SpacebarClientWellKnownResolverService>(testOutputHelper);
    private readonly SpacebarClientProviderService _clientProvider = fixture.GetRequiredService<SpacebarClientProviderService>(testOutputHelper);
    private readonly UserAbstraction _userAbstraction = fixture.GetRequiredService<UserAbstraction>(testOutputHelper);

    private static AuthenticatedSpacebarClient Client { get; set; } = null!;
    private static Guild? Guild { get; set; }
    private static Channel? Channel { get; set; }

    public async ValueTask InitializeAsync() {
        testOutputHelper.WriteLine("Running InitializeAsync");
        // All these tests can share a single client
        Client = await _userAbstraction.GetSharedUser();
        // ...and a guild
        Guild ??= await Client.CreateGuild(new() {
            Name = "Test guild"
        });
        Channel ??= await Client.GetGuild(Guild.Id).CreateChannelAsync(new() { Name = "meow", Type = 0 });
    }

    public static IEnumerable<object?[]> AutmodCombinations() {
        foreach (var triggerType in Enum.GetValues<AutomodTriggerType>())
            foreach (var enabled in (bool[])[true, false])
                foreach (var eventType in Enum.GetValues<AutomodEventType>())
                    foreach (var allowedRoles in (List<long[]>)[[], [-1]])
                        yield return [
                            triggerType, enabled, eventType, new AutomodAction[] {
                                new AutomodAction.BlockMessage() {
                                    Metadata = new AutomodAction.BlockMessage.MetadataContent() { CustomMessage = "meow" }
                                },
                                new AutomodAction.TimeoutUser() {
                                    Metadata = new AutomodAction.TimeoutUser.MetadataContent() {
                                        DurationSeconds = 40
                                    }
                                }
                            },
                            triggerType switch {
                                AutomodTriggerType.Keyword => new AutomodTriggerMetadata.KeywordTrigger() {
                                    AllowList = [],
                                    KeywordFilter = ["meowmeow"],
                                    RegexPatterns = ["me(o*)?w"],
                                },
                                AutomodTriggerType.HarmfulLink => null,
                                AutomodTriggerType.Spam => null,
                                AutomodTriggerType.KeywordPreset => new AutomodTriggerMetadata.KeywordPresetTrigger() {
                                    AllowList = [],
                                    Presets = [AutomodTriggerMetadata.KeywordPresetTrigger.PresetTypes.Slurs]
                                },
                                AutomodTriggerType.MentionSpam => new AutomodTriggerMetadata.MentionSpamTrigger() {
                                    MentionRaidProtectionEnabled = true,
                                    MentionTotalLimit = 5
                                },
                                AutomodTriggerType.UserProfile => new AutomodTriggerMetadata.UserProfileTrigger() {
                                    AllowList = [],
                                    KeywordFilter = ["meowmeow"],
                                    RegexPatterns = ["me(o*)?w"],
                                },
                                AutomodTriggerType.GuildPolicy => null,
                                _ => throw new ArgumentOutOfRangeException()
                            },
                            allowedRoles
                        ];
    }

    [Theory]
    [MemberData(nameof(AutmodCombinations))]
    public async Task CreateAutomodRule(AutomodTriggerType triggerType, bool enabled, AutomodEventType eventType, IEnumerable<AutomodAction> actions,
        AutomodTriggerMetadata? triggerMetadata, IEnumerable<long> allowedRoles) {
        AutomodRuleCreateRequest automodRule = triggerType switch {
            AutomodTriggerType.Keyword => new AutomodRuleCreateRequest.Keyword(),
            AutomodTriggerType.HarmfulLink => new AutomodRuleCreateRequest.HarmfulLink(),
            AutomodTriggerType.Spam => new AutomodRuleCreateRequest.Spam(),
            AutomodTriggerType.KeywordPreset => new AutomodRuleCreateRequest.KeywordPreset(),
            AutomodTriggerType.MentionSpam => new AutomodRuleCreateRequest.MentionSpam(),
            AutomodTriggerType.UserProfile => new AutomodRuleCreateRequest.UserProfile(),
            AutomodTriggerType.GuildPolicy => new AutomodRuleCreateRequest.GuildPolicy(),
            _ => throw new ArgumentOutOfRangeException(nameof(triggerType), triggerType, null)
        };

        // TriggerType = triggerType,
        automodRule.Enabled = true;
        automodRule.EventType = eventType;
        automodRule.Actions = actions.CastOrToList();
        automodRule.ExemptRoles = allowedRoles.Select(x => x == -1 ? Guild.Id : x).CastOrToList();

        // slightly hacky to avoid casting...
        if (triggerMetadata is not null) {
            var f = automodRule.GetType().GetProperty("TriggerMetadata");
            if (f is null) throw new Exception("Automod rule does not contain TriggerMetadata property?");
            if (f.SetMethod is null) throw new Exception("Automod rule's TriggerMetadata property has no setter?");
            f.SetMethod.Invoke(automodRule, [triggerMetadata]);
        }

        automodRule.Name = Guid.NewGuid().ToString();

        var r = await Assert.HttpSuccess(await Client.ApiHttpClient.PostAsJsonAsync(
            $"guilds/{Guild.Id}/auto-moderation/rules",
            automodRule,
            cancellationToken: TestContext.Current.CancellationToken
        ));
        var msg = await r.Content.ReadFromJsonAsync<AutomodRule>(new JsonSerializerOptions(JsonSerializerOptions.Default) {
            AllowOutOfOrderMetadataProperties = true
        }, cancellationToken: TestContext.Current.CancellationToken);

        _testOutputHelper.WriteLine(msg.ToJson());
    }
}