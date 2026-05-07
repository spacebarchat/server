using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Spacebar.AdminApi.Middleware;
using Spacebar.Interop.Authentication;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Tests;

public class AuthenticationMiddlewareTests {
    [Fact]
    public async Task InvokeAsyncAllowsPingWithoutAuthentication() {
        var auth = new FakeAuthenticationService {
            ValidationException = new InvalidOperationException("Authentication should not be called for ping"),
        };

        var result = await InvokeMiddlewareAsync(auth, path: "/ping");

        Assert.True(result.NextCalled);
        Assert.Equal(204, result.StatusCode);
        Assert.Equal(0, auth.ValidateTokenCallCount);
        Assert.Equal(0, auth.GetCurrentUserCallCount);
    }

    [Fact]
    public async Task InvokeAsyncAllowsRequestsWhenAuthenticationIsDisabled() {
        var auth = new FakeAuthenticationService {
            ValidationException = new InvalidOperationException("Authentication should not be called when disabled"),
        };

        var result = await InvokeMiddlewareAsync(auth, disableAuthentication: true);

        Assert.True(result.NextCalled);
        Assert.Equal(204, result.StatusCode);
        Assert.Equal(0, auth.ValidateTokenCallCount);
        Assert.Equal(0, auth.GetCurrentUserCallCount);
    }

    [Fact]
    public async Task InvokeAsyncRejectsInvalidTokenResults() {
        var auth = new FakeAuthenticationService {
            ValidationResult = new TokenValidationResult(),
        };

        var result = await InvokeMiddlewareAsync(auth);

        Assert.False(result.NextCalled);
        Assert.Equal(401, result.StatusCode);
        Assert.Equal("Invalid token", result.Body);
        Assert.Equal(1, auth.ValidateTokenCallCount);
        Assert.Equal(0, auth.GetCurrentUserCallCount);
    }

    [Fact]
    public async Task InvokeAsyncRejectsTokenValidationExceptions() {
        var auth = new FakeAuthenticationService {
            ValidationException = new UnauthorizedAccessException("Missing token"),
        };

        var result = await InvokeMiddlewareAsync(auth);

        Assert.False(result.NextCalled);
        Assert.Equal(401, result.StatusCode);
        Assert.Equal("Invalid token", result.Body);
        Assert.Equal(1, auth.ValidateTokenCallCount);
        Assert.Equal(0, auth.GetCurrentUserCallCount);
    }

    [Fact]
    public async Task InvokeAsyncRejectsNonOperatorsOnProtectedPaths() {
        var auth = new FakeAuthenticationService {
            CurrentUser = UserWithRights(SpacebarRights.Rights.SEND_MESSAGES),
        };

        var result = await InvokeMiddlewareAsync(auth, path: "/whoami");

        Assert.False(result.NextCalled);
        Assert.Equal(403, result.StatusCode);
        Assert.Equal("User is not an operator", result.Body);
        Assert.Equal(1, auth.ValidateTokenCallCount);
        Assert.Equal(1, auth.GetCurrentUserCallCount);
    }

    [Fact]
    public async Task InvokeAsyncAllowsOperatorsOnProtectedPaths() {
        var auth = new FakeAuthenticationService {
            CurrentUser = UserWithRights(SpacebarRights.Rights.OPERATOR),
        };

        var result = await InvokeMiddlewareAsync(auth, path: "/whoami");

        Assert.True(result.NextCalled);
        Assert.Equal(204, result.StatusCode);
        Assert.Empty(result.Body);
        Assert.Equal(1, auth.ValidateTokenCallCount);
        Assert.Equal(1, auth.GetCurrentUserCallCount);
    }

    private static async Task<MiddlewareResult> InvokeMiddlewareAsync(
        FakeAuthenticationService auth,
        string path = "/whoami",
        bool disableAuthentication = false
    ) {
        var context = new DefaultHttpContext {
            RequestServices = new EmptyServiceProvider(),
        };
        context.Request.Path = path;
        context.Response.Body = new MemoryStream();

        var nextCalled = false;
        RequestDelegate next = nextContext => {
            nextCalled = true;
            nextContext.Response.StatusCode = 204;
            return Task.CompletedTask;
        };

        var middleware = new AuthenticationMiddleware(auth, CreateConfig(disableAuthentication), next);
        await middleware.InvokeAsync(context, context.RequestServices);

        context.Response.Body.Position = 0;
        using var reader = new StreamReader(context.Response.Body, Encoding.UTF8);
        return new MiddlewareResult(context.Response.StatusCode, await reader.ReadToEndAsync(), nextCalled);
    }

    private static SpacebarAuthenticationConfiguration CreateConfig(bool disableAuthentication) {
        var configuration = new ConfigurationManager();
        configuration["Spacebar:Authentication:PrivateKeyPath"] = "/tmp/private.pem";
        configuration["Spacebar:Authentication:PublicKeyPath"] = "/tmp/public.pem";

        return new SpacebarAuthenticationConfiguration(configuration) {
            PrivateKeyPath = "/tmp/private.pem",
            PublicKeyPath = "/tmp/public.pem",
            DisableAuthentication = disableAuthentication,
        };
    }

    private static User UserWithRights(SpacebarRights.Rights rights) =>
        new() {
            Rights = (ulong)rights,
        };

    private sealed record MiddlewareResult(int StatusCode, string Body, bool NextCalled);

    private sealed class EmptyServiceProvider : IServiceProvider {
        public object? GetService(Type serviceType) => null;
    }

    private sealed class FakeAuthenticationService : ISpacebarAspNetAuthenticationService {
        public TokenValidationResult? ValidationResult { get; init; } = new() {
            IsValid = true,
        };

        public Exception? ValidationException { get; init; }

        public User CurrentUser { get; init; } = UserWithRights(SpacebarRights.Rights.OPERATOR);

        public int ValidateTokenCallCount { get; private set; }

        public int GetCurrentUserCallCount { get; private set; }

        public string GetTokenAsync(HttpRequest request) => "test-token";

        public Task<TokenValidationResult?> ValidateTokenAsync(HttpRequest request) {
            ValidateTokenCallCount++;
            if (ValidationException is not null) throw ValidationException;

            return Task.FromResult(ValidationResult);
        }

        public Task<User> GetCurrentUserAsync(HttpRequest request) {
            GetCurrentUserCallCount++;
            return Task.FromResult(CurrentUser);
        }

        public Task<Session> GetCurrentSessionAsync(HttpRequest request) => Task.FromResult(new Session());
    }
}
