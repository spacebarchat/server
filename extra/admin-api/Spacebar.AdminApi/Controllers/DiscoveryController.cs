using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Replication.Abstractions;
using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Controllers;

[ApiController]
[Route("/discovery")]
public class DiscoveryController(
    ILogger<DiscoveryController> logger,
    SpacebarDbContext db,
    IServiceProvider sp,
    SpacebarAspNetAuthenticationService auth,
    ISpacebarReplication replication
) : ControllerBase {
    [HttpGet]
    public async IAsyncEnumerable<DiscoverableGuildModel> GetDiscoverableGuilds(bool includeExcluded = false) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        var discoverableGuilds = db.Guilds
            .AsNoTracking()
            .Where(x => (!x.DiscoveryExcluded || includeExcluded) && x.Features.Contains("DISCOVERABLE"))
            .OrderByDescending(x => x.DiscoveryWeight)
            .ThenByDescending(x => x.MemberCount);
        await foreach (var guild in discoverableGuilds.AsAsyncEnumerable()) {
            yield return new DiscoverableGuildModel() {
                Id = guild.Id,
                Features = guild.Features.Split(",").ToList(),
                Banner = guild.Banner,
                DiscoveryExcluded = guild.DiscoveryExcluded,
                DiscoveryWeight = guild.DiscoveryWeight,
                MemberCount = guild.MemberCount,
                Name = guild.Name,
                SystemChannelFlags = guild.SystemChannelFlags,
                AfkChannelId = guild.AfkChannelId,
                AfkTimeout = guild.AfkTimeout,
                ChannelOrdering = guild.ChannelOrdering.Split(",").ToList(),
                DefaultMessageNotifications = guild.DefaultMessageNotifications,
                Description = guild.Description,
                DiscoverySplash = guild.DiscoverySplash,
                ExplicitContentFilter = guild.ExplicitContentFilter,
                Icon = guild.Icon,
                Large = guild.Large,
                MaxMembers = guild.MaxMembers,
                MaxPresences = guild.MaxPresences,
                MaxVideoChannelUsers = guild.MaxVideoChannelUsers,
                MfaLevel = guild.MfaLevel,
                Nsfw = guild.Nsfw,
                NsfwLevel = guild.NsfwLevel,
                OwnerId = guild.OwnerId,
                Parent = guild.Parent,
                PreferredLocale = guild.PreferredLocale,
                PremiumProgressBarEnabled = guild.PremiumProgressBarEnabled,
                PremiumTier = guild.PremiumTier,
                PremiumSubscriptionCount = guild.PremiumSubscriptionCount,
                PresenceCount = guild.PresenceCount,
                PrimaryCategoryId = guild.PrimaryCategoryId,
                PublicUpdatesChannelId = guild.PublicUpdatesChannelId,
                Region = guild.Region,
                RulesChannelId = guild.RulesChannelId,
                Splash = guild.Splash,
                SystemChannelId = guild.SystemChannelId,
                TemplateId = guild.TemplateId,
                Unavailable = guild.Unavailable,
                VerificationLevel = guild.VerificationLevel,
                WelcomeScreen = guild.WelcomeScreen,
                WidgetChannelId = guild.WidgetChannelId,
                WidgetEnabled = guild.WidgetEnabled
            };
        }
    }

    [HttpGet("{guildId}")]
    public async Task<DiscoverableGuildModel> GetDiscoverableGuild(string guildId, bool includeExcluded = false) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        var discoverableGuilds = db.Guilds
            .AsNoTracking()
            .Where(x => x.Id == guildId)
            .Where(x => (!x.DiscoveryExcluded || includeExcluded) && x.Features.Contains("DISCOVERABLE"))
            .OrderByDescending(x => x.DiscoveryWeight)
            .ThenByDescending(x => x.MemberCount);
        var guild = await discoverableGuilds.SingleAsync();
        return new DiscoverableGuildModel() {
            Id = guild.Id,
            Features = guild.Features.Split(",").ToList(),
            Banner = guild.Banner,
            DiscoveryExcluded = guild.DiscoveryExcluded,
            DiscoveryWeight = guild.DiscoveryWeight,
            MemberCount = guild.MemberCount,
            Name = guild.Name,
            SystemChannelFlags = guild.SystemChannelFlags,
            AfkChannelId = guild.AfkChannelId,
            AfkTimeout = guild.AfkTimeout,
            ChannelOrdering = guild.ChannelOrdering.Split(",").ToList(),
            DefaultMessageNotifications = guild.DefaultMessageNotifications,
            Description = guild.Description,
            DiscoverySplash = guild.DiscoverySplash,
            ExplicitContentFilter = guild.ExplicitContentFilter,
            Icon = guild.Icon,
            Large = guild.Large,
            MaxMembers = guild.MaxMembers,
            MaxPresences = guild.MaxPresences,
            MaxVideoChannelUsers = guild.MaxVideoChannelUsers,
            MfaLevel = guild.MfaLevel,
            Nsfw = guild.Nsfw,
            NsfwLevel = guild.NsfwLevel,
            OwnerId = guild.OwnerId,
            Parent = guild.Parent,
            PreferredLocale = guild.PreferredLocale,
            PremiumProgressBarEnabled = guild.PremiumProgressBarEnabled,
            PremiumTier = guild.PremiumTier,
            PremiumSubscriptionCount = guild.PremiumSubscriptionCount,
            PresenceCount = guild.PresenceCount,
            PrimaryCategoryId = guild.PrimaryCategoryId,
            PublicUpdatesChannelId = guild.PublicUpdatesChannelId,
            Region = guild.Region,
            RulesChannelId = guild.RulesChannelId,
            Splash = guild.Splash,
            SystemChannelId = guild.SystemChannelId,
            TemplateId = guild.TemplateId,
            Unavailable = guild.Unavailable,
            VerificationLevel = guild.VerificationLevel,
            WelcomeScreen = guild.WelcomeScreen,
            WidgetChannelId = guild.WidgetChannelId,
            WidgetEnabled = guild.WidgetEnabled
        };
    }

    [HttpPatch("{guildId}")]
    public async Task<DiscoverableGuildModel> UpdateDiscoverableGuild(string guildId, [FromBody] DiscoverableGuildUpdateModel guildUpdateModel, bool includeExcluded = false) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        var guild = await db.Guilds
            .AsNoTracking()
            .Where(x => x.Id == guildId)
            .Where(x => (!x.DiscoveryExcluded || includeExcluded) && x.Features.Contains("DISCOVERABLE"))
            .OrderByDescending(x => x.DiscoveryWeight)
            .ThenByDescending(x => x.MemberCount)
            .SingleAsync();

        if (guildUpdateModel.DiscoveryExcluded != null)
            guild.DiscoveryExcluded = guildUpdateModel.DiscoveryExcluded.Value;

        if (guildUpdateModel.DiscoveryWeight != null)
            guild.DiscoveryWeight = guildUpdateModel.DiscoveryWeight.Value;

        db.Guilds.Update(guild);
        await db.SaveChangesAsync();

        return new DiscoverableGuildModel() {
            Id = guild.Id,
            Features = guild.Features.Split(",").ToList(),
            Banner = guild.Banner,
            DiscoveryExcluded = guild.DiscoveryExcluded,
            DiscoveryWeight = guild.DiscoveryWeight,
            MemberCount = guild.MemberCount,
            Name = guild.Name,
            SystemChannelFlags = guild.SystemChannelFlags,
            AfkChannelId = guild.AfkChannelId,
            AfkTimeout = guild.AfkTimeout,
            ChannelOrdering = guild.ChannelOrdering.Split(",").ToList(),
            DefaultMessageNotifications = guild.DefaultMessageNotifications,
            Description = guild.Description,
            DiscoverySplash = guild.DiscoverySplash,
            ExplicitContentFilter = guild.ExplicitContentFilter,
            Icon = guild.Icon,
            Large = guild.Large,
            MaxMembers = guild.MaxMembers,
            MaxPresences = guild.MaxPresences,
            MaxVideoChannelUsers = guild.MaxVideoChannelUsers,
            MfaLevel = guild.MfaLevel,
            Nsfw = guild.Nsfw,
            NsfwLevel = guild.NsfwLevel,
            OwnerId = guild.OwnerId,
            Parent = guild.Parent,
            PreferredLocale = guild.PreferredLocale,
            PremiumProgressBarEnabled = guild.PremiumProgressBarEnabled,
            PremiumTier = guild.PremiumTier,
            PremiumSubscriptionCount = guild.PremiumSubscriptionCount,
            PresenceCount = guild.PresenceCount,
            PrimaryCategoryId = guild.PrimaryCategoryId,
            PublicUpdatesChannelId = guild.PublicUpdatesChannelId,
            Region = guild.Region,
            RulesChannelId = guild.RulesChannelId,
            Splash = guild.Splash,
            SystemChannelId = guild.SystemChannelId,
            TemplateId = guild.TemplateId,
            Unavailable = guild.Unavailable,
            VerificationLevel = guild.VerificationLevel,
            WelcomeScreen = guild.WelcomeScreen,
            WidgetChannelId = guild.WidgetChannelId,
            WidgetEnabled = guild.WidgetEnabled
        };
    }
}