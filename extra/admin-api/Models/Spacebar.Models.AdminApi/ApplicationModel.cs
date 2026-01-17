namespace Spacebar.Models.AdminApi;

public class ApplicationModel {
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Icon { get; set; }
    public string? Description { get; set; }
    public string? Summary { get; set; }
    public string? Type { get; set; }
    public bool Hook { get; set; }
    public bool BotPublic { get; set; }
    public bool BotRequireCodeGrant { get; set; }
    public int Flags { get; set; }
    public string? RedirectUris { get; set; }
    public int? RpcApplicationState { get; set; }
    public int? StoreApplicationState { get; set; }
    public int? VerificationState { get; set; }
    public string? InteractionsEndpointUrl { get; set; }
    public bool? IntegrationPublic { get; set; }
    public bool? IntegrationRequireCodeGrant { get; set; }
    public int? DiscoverabilityState { get; set; }
    public int? DiscoveryEligibilityFlags { get; set; }
    public string? Tags { get; set; }
    public string? CoverImage { get; set; }
    public string? InstallParams { get; set; }
    public string? TermsOfServiceUrl { get; set; }
    public string? PrivacyPolicyUrl { get; set; }
    public string? GuildId { get; set; }
    public string? CustomInstallUrl { get; set; }
    public string? OwnerId { get; set; }
    public string? BotUserId { get; set; }
    public string? TeamId { get; set; }
}