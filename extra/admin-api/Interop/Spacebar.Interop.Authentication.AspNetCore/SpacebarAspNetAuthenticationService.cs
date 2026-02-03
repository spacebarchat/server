using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;
using Spacebar.Models.Db.Models;

namespace Spacebar.Interop.Authentication.AspNetCore;

public class SpacebarAspNetAuthenticationService(SpacebarAuthenticationService authService) {
    public string GetTokenAsync(HttpRequest request) {
        if (!request.Headers.ContainsKey("Authorization")) {
            Console.WriteLine(string.Join(", ", request.Headers.Keys));
            throw new UnauthorizedAccessException();
        }

        return request.Headers["Authorization"].ToString().Split(' ').Last();
    }

    public async Task<TokenValidationResult?> ValidateTokenAsync(HttpRequest request) {
        var token = GetTokenAsync(request);
        return await authService.ValidateTokenAsync(token);
    }

    public async Task<User> GetCurrentUserAsync(HttpRequest request) {
        var token = GetTokenAsync(request);
        return await authService.GetCurrentUserAsync(token);
    }
}