using Spacebar.AdminApi.Middleware;
using Spacebar.Models.AdminApi;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Tests;

public class AdminAuthenticationPolicyTests {
    [Fact]
    public void GetFailureAllowsOperators() {
        var user = UserWithRights(SpacebarRights.Rights.OPERATOR);

        Assert.Null(AdminAuthenticationPolicy.GetFailure(user));
    }

    [Fact]
    public void GetFailureRejectsNormalUsers() {
        var user = UserWithRights(SpacebarRights.Rights.SEND_MESSAGES);

        var failure = AdminAuthenticationPolicy.GetFailure(user);

        Assert.Equal(AdminAuthenticationFailure.MissingOperatorRight, failure);
        Assert.NotNull(failure);
        Assert.Equal("User is not an operator", AdminAuthenticationPolicy.GetFailureMessage(failure.GetValueOrDefault()));
    }

    [Fact]
    public void GetFailureRejectsDisabledUsersBeforeRightsChecks() {
        var user = UserWithRights(SpacebarRights.Rights.OPERATOR);
        user.Disabled = true;

        var failure = AdminAuthenticationPolicy.GetFailure(user);

        Assert.Equal(AdminAuthenticationFailure.Disabled, failure);
        Assert.NotNull(failure);
        Assert.Equal("User is disabled", AdminAuthenticationPolicy.GetFailureMessage(failure.GetValueOrDefault()));
    }

    [Fact]
    public void GetFailureRejectsDeletedUsersBeforeRightsChecks() {
        var user = UserWithRights(SpacebarRights.Rights.OPERATOR);
        user.Deleted = true;

        var failure = AdminAuthenticationPolicy.GetFailure(user);

        Assert.Equal(AdminAuthenticationFailure.Deleted, failure);
        Assert.NotNull(failure);
        Assert.Equal("User is deleted", AdminAuthenticationPolicy.GetFailureMessage(failure.GetValueOrDefault()));
    }

    private static User UserWithRights(SpacebarRights.Rights rights) =>
        new() {
            Rights = (ulong)rights,
        };
}
