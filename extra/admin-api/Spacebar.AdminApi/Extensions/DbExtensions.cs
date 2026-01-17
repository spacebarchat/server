using Microsoft.EntityFrameworkCore;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Extensions;

public static class DbExtensions {
    public static string? GetString(this DbSet<Config> config, string key) => config.Find(key)?.Value;
    public static SpacebarRights.Rights GetRights(this User user) => (SpacebarRights.Rights)user.Rights;
}