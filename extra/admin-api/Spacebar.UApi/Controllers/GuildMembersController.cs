using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.DataMappings.Generic;
using Spacebar.Models.Generic;

namespace Spacebar.UApi.Controllers;

[Route("/api/v{_}/guilds/{guildId}/members/")]
public class GuildMembersController(ILogger<GuildMembersController> logger, SpacebarDbContext db, SpacebarAspNetAuthenticationService authService) : ControllerBase {
    /// <summary>
    ///     Get a guild member by ID
    /// </summary>
    /// <param name="guildId">Guild ID</param>
    /// <param name="memberId">Member ID</param>
    /// <returns>The public member projection</returns>
    /// <exception cref="InvalidOperationException">An error has occured</exception>
    [HttpGet("{memberId}")]
    public async Task<Member> GetMemberAsync(string guildId, string memberId) {
        var user = await authService.GetCurrentUserAsync(Request);
        var cmember = db.Members.SingleOrDefault(x => x.Id == user.Id && x.GuildId == guildId);
        if (cmember is null)
            throw new InvalidOperationException("You are not a member of this guild.");

        var member = db.Members
            .Include(x => x.IdNavigation) // User object
            .Include(x => x.Roles)
            .SingleOrDefault(x => x.Id == user.Id && x.GuildId == guildId);

        if (member is null)
            throw new InvalidOperationException("Member not found");

        return member.ToPublicMember();
    }
}