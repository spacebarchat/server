namespace Spacebar.AdminApi.Models;

public class ForceJoinRequest {
    public string? UserId { get; set; } = null!;
    public bool MakeAdmin { get; set; } = false;
    public bool MakeOwner { get; set; } = false;
}