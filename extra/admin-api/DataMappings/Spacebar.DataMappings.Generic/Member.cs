using Spacebar.Models.Generic;

namespace Spacebar.DataMappings.Generic;

public static class MemberExtensions
{
    public static Member ToPublicMember(this Models.Db.Models.Member member, PartialUser? partialUser = null)
    {
        return new()
        {
            User = partialUser ?? member.IdNavigation.ToPartialUser(),
            AvatarDecorationData = member.AvatarDecorationData,
            Avatar = string.IsNullOrWhiteSpace(member.Avatar) ? null : member.Avatar,
            Banner = string.IsNullOrWhiteSpace(member.Banner) ? null : member.Banner,
            Collectibles = member.Collectibles,
            DisplayNameStyles = member.DisplayNameStyles,
            Bio = string.IsNullOrWhiteSpace(member.Bio) ? null : member.Bio,
            Nick = string.IsNullOrWhiteSpace(member.Nick) ? null : member.Nick,
            Roles = member.Roles.Select(x=>x.Id).ToList()
        };
    }
}