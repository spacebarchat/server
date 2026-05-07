using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Spacebar.Models.Db.Models;

namespace Spacebar.Interop.Authentication.AspNetCore;

public interface ISpacebarAspNetAuthenticationService {
    string GetTokenAsync(HttpRequest request);

    Task<TokenValidationResult?> ValidateTokenAsync(HttpRequest request);

    Task<User> GetCurrentUserAsync(HttpRequest request);

    Task<Session> GetCurrentSessionAsync(HttpRequest request);
}
