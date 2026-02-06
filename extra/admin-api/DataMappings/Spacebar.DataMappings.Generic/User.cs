using Spacebar.Models.Generic;

namespace Spacebar.DataMappings.Generic;

public static class User
{
    public static PartialUser ToPartialUser(this Models.Db.Models.User user)
    {
        return new PartialUser() {
            Id = user.Id,
            Discriminator = user.Discriminator,
            Username = user.Username,
            AccentColor = user.AccentColor,
            Avatar = user.Avatar,
            AvatarDecorationData = user.AvatarDecorationData,
            Banner = user.Banner,
            Bot = user.Bot,
            Collectibles = user.Collectibles,
            DisplayNameStyles = user.DisplayNameStyles,
            // GlobalName = x.GlobalName,
            PrimaryGuild = user.PrimaryGuild,
            PublicFlags = user.PublicFlags,
            System = user.System,
        };
    }
}