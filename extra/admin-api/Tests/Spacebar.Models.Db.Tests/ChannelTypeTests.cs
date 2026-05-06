using Microsoft.EntityFrameworkCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.Models.Db.Tests;

public class ChannelTypeTests {
    [Theory]
    [InlineData(ChannelType.GuildText, 0)]
    [InlineData(ChannelType.Dm, 1)]
    [InlineData(ChannelType.GuildVoice, 2)]
    [InlineData(ChannelType.GroupDm, 3)]
    [InlineData(ChannelType.GuildCategory, 4)]
    [InlineData(ChannelType.GuildNews, 5)]
    [InlineData(ChannelType.GuildStore, 6)]
    [InlineData(ChannelType.GuildLfg, 7)]
    [InlineData(ChannelType.LfgGroupDm, 8)]
    [InlineData(ChannelType.ThreadAlpha, 9)]
    [InlineData(ChannelType.GuildNewsThread, 10)]
    [InlineData(ChannelType.GuildPublicThread, 11)]
    [InlineData(ChannelType.GuildPrivateThread, 12)]
    [InlineData(ChannelType.GuildStageVoice, 13)]
    [InlineData(ChannelType.GuildDirectory, 14)]
    [InlineData(ChannelType.GuildForum, 15)]
    [InlineData(ChannelType.GuildMedia, 16)]
    [InlineData(ChannelType.Lobby, 17)]
    [InlineData(ChannelType.EphemeralDm, 18)]
    [InlineData(ChannelType.Unhandled, 255)]
    public void ValuesMatchDiscordChannelTypeIds(ChannelType channelType, int expectedValue) {
        Assert.Equal(expectedValue, (int)channelType);
    }

    [Fact]
    public void ChannelEntityUsesTypedChannelType() {
        var channel = new Channel {
            Type = ChannelType.Dm,
        };

        Assert.Equal(ChannelType.Dm, channel.Type);
    }

    [Fact]
    public async Task ChannelTypeQueriesMatchStoredEnumValues() {
        await using var db = new SpacebarDbContext(
            new DbContextOptionsBuilder<SpacebarDbContext>()
                .UseInMemoryDatabase($"{nameof(ChannelTypeQueriesMatchStoredEnumValues)}-{Guid.NewGuid()}")
                .Options
        );
        db.Channels.AddRange(
            new Channel { Id = 1, Type = ChannelType.Dm },
            new Channel { Id = 2, Type = ChannelType.GroupDm },
            new Channel { Id = 3, Type = ChannelType.GuildVoice }
        );
        await db.SaveChangesAsync();

        var directMessageIds = await db.Channels
            .Where(channel => channel.Type == ChannelType.Dm)
            .Select(channel => channel.Id)
            .ToListAsync();
        var voiceChannelIds = await db.Channels
            .Where(channel => channel.Type == ChannelType.GuildVoice)
            .Select(channel => channel.Id)
            .ToListAsync();

        Assert.Equal([1], directMessageIds);
        Assert.Equal([3], voiceChannelIds);
    }
}
