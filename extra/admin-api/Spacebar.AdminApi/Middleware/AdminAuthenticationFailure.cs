namespace Spacebar.AdminApi.Middleware;

/// <summary>
/// Reason an otherwise valid Spacebar user cannot authenticate to the Admin API.
/// </summary>
public enum AdminAuthenticationFailure {
    /// <summary>The user account is disabled.</summary>
    Disabled,
    /// <summary>The user account is deleted.</summary>
    Deleted,
    /// <summary>The user does not have the instance operator right required for admin authentication.</summary>
    MissingOperatorRight,
}
