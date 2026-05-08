using System.Collections.Immutable;
using Microsoft.EntityFrameworkCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Generic.Constants;

namespace Spacebar.UApi.Services;

public class PermissionService(SpacebarDbContext db) {
    /// <summary>
    ///     Asserts that user has all the relevant guild permissions
    /// </summary>
    /// <param name="guildId">Guild ID</param>
    /// <param name="userId">Member ID</param>
    public async Task<Permissions> GetUserGuildPermissions(long guildId, long userId) {
        var member = await db.Members
            .Include(x => x.Roles)
            .SingleAsync(x => x.Id == userId && x.GuildId == guildId);

        if (member is null)
            throw new InvalidOperationException("You are not a member of this guild.");

        var permissions = member.Roles.Aggregate((Permissions)0UL, (current, role) => current | (Permissions)ulong.Parse(role.Permissions));

        if (member.CommunicationDisabledUntil is not null && member.CommunicationDisabledUntil > DateTime.UtcNow) {
            permissions &= Permissions.ViewChannel | Permissions.ReadMessageHistory;
        }

        return permissions;
    }
    
    /// <summary>
    ///     Asserts that user has all the relevant guild permissions
    /// </summary>
    /// <param name="permission">Permissions to require</param>
    /// <param name="guildId">Guild ID</param>
    /// <param name="userId">Member ID</param>
    /// <exception cref="InvalidOperationException">Has one or more missing permissions</exception>
    public async Task AssertUserHasGuildPermission(Permissions permission, long guildId, long userId) {
        var permissions = await GetUserGuildPermissions(guildId, userId);

        if (!permissions.HasFlag(permission))
            throw new PermissionException(Enum.GetValues<Permissions>().Where(p => !permissions.HasFlag(p) && permission.HasFlag(p)).ToList());
    }
}

/// <summary>
///     Thrown when a user is missing a given permission
/// </summary>
public class PermissionException : Exception {
    /// <summary>
    ///   The list of missing permissions
    /// </summary>
    public ImmutableList<Permissions> MissingPermissions { get; }

    /// <inheritdoc />
    public PermissionException(IReadOnlyCollection<Permissions> missingPermissions) : base(
        $"You do not have the required permissions to perform this action: {string.Join(", ", missingPermissions)}") {
        MissingPermissions = missingPermissions.ToImmutableList();
    }
}