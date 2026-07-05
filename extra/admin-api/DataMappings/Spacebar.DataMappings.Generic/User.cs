using System.Text.Json;
using System.Text.Json.Nodes;
using Spacebar.Models.Generic;

namespace Spacebar.DataMappings.Generic;

public static class User
{
    public static PartialUser ToPartialUser(this Models.Db.Models.User user)
    {
        return new PartialUser()
        {
            Id = user.Id,
            Discriminator = user.Discriminator,
            Username = user.Username,
            AccentColor = user.AccentColor,
            Avatar = user.Avatar,
            AvatarDecorationData = string.IsNullOrWhiteSpace(user.AvatarDecorationData) ? null : JsonSerializer.Deserialize<JsonObject>(user.AvatarDecorationData), // TODO: schema
            Banner = user.Banner,
            Bot = user.Bot,
            Collectibles = string.IsNullOrWhiteSpace(user.Collectibles) ? null : JsonSerializer.Deserialize<JsonObject>(user.Collectibles), // TODO: schema
            DisplayNameStyles = JsonSerializer.Deserialize<DisplayNameStyle>(user.DisplayNameStyles ?? "null"),
            // GlobalName = x.GlobalName,
            PrimaryGuild = string.IsNullOrWhiteSpace(user.PrimaryGuild) ? null : JsonSerializer.Deserialize<JsonObject>(user.PrimaryGuild), // TODO: schema
            PublicFlags = user.PublicFlags,
            System = user.System,
        };
    }

    extension(Models.Db.Models.User user)
    {
        public string Tag => $"{user.Username}#{user.Discriminator}";
    }
}