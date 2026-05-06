using System.Text.Json;
using Spacebar.UApi.Models;
using Xunit;

namespace Spacebar.UApi.Tests;

public class GuildTemplateTests {
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    [Fact]
    public void DeserializesSerializedSourceGuildSchema() {
        var template = JsonSerializer.Deserialize<GuildTemplate>(
            """
            {
              "code": "abc123",
              "name": "Template",
              "description": null,
              "usage_count": 7,
              "creator_id": "111111111111111111",
              "creator": {
                "id": "111111111111111111",
                "username": "creator",
                "discriminator": "0001",
                "avatar": null
              },
              "created_at": "2026-01-02T03:04:05Z",
              "updated_at": "2026-01-03T03:04:05Z",
              "source_guild_id": "222222222222222222",
              "serialized_source_guild": {
                "id": "222222222222222222",
                "name": "Source Guild",
                "description": null,
                "region": "deprecated",
                "verification_level": 2,
                "default_message_notifications": 1,
                "explicit_content_filter": 2,
                "preferred_locale": "en-US",
                "afk_timeout": 300,
                "afk_channel_id": null,
                "system_channel_id": "333333333333333333",
                "system_channel_flags": 3,
                "icon": null,
                "roles": [
                  {
                    "id": "222222222222222222",
                    "name": "@everyone",
                    "permissions": "104324673",
                    "colors": {
                      "primary_color": 0,
                      "secondary_color": null,
                      "tertiary_color": 0
                    },
                    "hoist": false,
                    "mentionable": false,
                    "position": 0,
                    "managed": false,
                    "flags": 0
                  }
                ],
                "channels": [
                  {
                    "id": "444444444444444444",
                    "type": 0,
                    "name": "general",
                    "position": 1,
                    "parent_id": null,
                    "topic": "hello",
                    "nsfw": false,
                    "rate_limit_per_user": 0,
                    "permission_overwrites": [
                      {
                        "id": "222222222222222222",
                        "type": 0,
                        "allow": "0",
                        "deny": "1024"
                      }
                    ]
                  }
                ]
              }
            }
            """,
            JsonOptions
        );

        Assert.NotNull(template);
        Assert.Equal(111111111111111111L, template.CreatorId);
        Assert.Equal(111111111111111111L, template.Creator?.Id);
        Assert.Equal(222222222222222222L, template.SourceGuildId);
        Assert.Equal("Source Guild", template.SerializedSourceGuild.Name);
        Assert.Null(template.SerializedSourceGuild.Description);
        Assert.Null(template.SerializedSourceGuild.AfkChannelId);
        Assert.Equal(333333333333333333L, template.SerializedSourceGuild.SystemChannelId);
        Assert.Single(template.SerializedSourceGuild.Roles);
        Assert.Single(template.SerializedSourceGuild.Channels);
        Assert.Equal(444444444444444444L, template.SerializedSourceGuild.Channels[0].Id);
        Assert.Single(template.SerializedSourceGuild.Channels[0].PermissionOverwrites);
    }

    [Fact]
    public void SerializesSnowflakesAsStringsAndPreservesDiscordFieldNames() {
        var template = new GuildTemplate {
            Code = "abc123",
            Name = "Template",
            UsageCount = 1,
            CreatorId = 111111111111111111L,
            CreatedAt = DateTimeOffset.Parse("2026-01-02T03:04:05Z"),
            UpdatedAt = DateTimeOffset.Parse("2026-01-03T03:04:05Z"),
            SourceGuildId = 222222222222222222L,
            SerializedSourceGuild = new SerializedSourceGuild {
                Id = 222222222222222222L,
                Name = "Source Guild",
                PreferredLocale = "en-US",
                SystemChannelId = 333333333333333333L,
                Roles = [
                    new GuildTemplateRole {
                        Id = 222222222222222222L,
                        Name = "@everyone",
                        Permissions = "104324673",
                        Colors = new RoleColors(),
                    },
                ],
                Channels = [
                    new GuildTemplateChannel {
                        Id = 444444444444444444L,
                        Type = 0,
                        Name = "general",
                        PermissionOverwrites = [
                            new GuildTemplateChannelPermissionOverwrite {
                                Id = 222222222222222222L,
                                Type = 0,
                                Deny = "1024",
                            },
                        ],
                    },
                ],
            },
        };

        var json = JsonSerializer.Serialize(template, JsonOptions);

        Assert.Contains("\"creator_id\":\"111111111111111111\"", json);
        Assert.Contains("\"source_guild_id\":\"222222222222222222\"", json);
        Assert.Contains("\"serialized_source_guild\":", json);
        Assert.Contains("\"preferred_locale\":\"en-US\"", json);
        Assert.Contains("\"system_channel_id\":\"333333333333333333\"", json);
        Assert.Contains("\"permission_overwrites\":", json);
        Assert.DoesNotContain("\"serialized_source_guild\":{}", json);
    }
}
