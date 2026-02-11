using Spacebar.Models.Db.Models;

namespace Spacebar.GatewayOffload.Extensions.Db;

public static class UserExtensions {
    extension(User user) {
        public string Tag => $"{user.Username}#{user.Discriminator}";
    }
}