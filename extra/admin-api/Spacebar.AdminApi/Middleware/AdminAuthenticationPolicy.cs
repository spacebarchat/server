using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Middleware;

/// <summary>
/// Enforces the Admin API authentication boundary after a Spacebar token resolves to a user.
/// </summary>
public static class AdminAuthenticationPolicy {
    /// <summary>
    /// Returns why a user cannot authenticate to the Admin API, or null when authentication may continue.
    /// </summary>
    public static AdminAuthenticationFailure? GetFailure(User user) {
        if (user.Disabled) return AdminAuthenticationFailure.Disabled;
        if (user.Deleted) return AdminAuthenticationFailure.Deleted;
        if (!user.GetRights().HasAllRights(SpacebarRights.Rights.OPERATOR)) return AdminAuthenticationFailure.MissingOperatorRight;

        return null;
    }

    /// <summary>
    /// Maps an admin authentication failure to the existing plain-text middleware response body.
    /// </summary>
    public static string GetFailureMessage(AdminAuthenticationFailure failure) =>
        failure switch {
            AdminAuthenticationFailure.Disabled => "User is disabled",
            AdminAuthenticationFailure.Deleted => "User is deleted",
            AdminAuthenticationFailure.MissingOperatorRight => "User is not an operator",
            _ => "Forbidden",
        };
}
