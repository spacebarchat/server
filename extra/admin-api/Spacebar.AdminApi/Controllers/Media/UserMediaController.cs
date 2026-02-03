using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;

namespace Spacebar.AdminApi.Controllers.Media;

[ApiController]
[Route("/media/user")]
public class UserMediaController(ILogger<UserMediaController> logger, SpacebarDbContext db, SpacebarAspNetAuthenticationService auth, IServiceProvider sp) : ControllerBase {
    [HttpGet("{userId}/attachments")]
    public async IAsyncEnumerable<Attachment> GetAttachmentsByUser(string userId) {
        (await auth.GetCurrentUserAsync(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var db2 = sp.CreateScope().ServiceProvider.GetService<SpacebarDbContext>();
        var attachments = db.Attachments
            // .IgnoreAutoIncludes()
            .Where(x => x.Message!.AuthorId == userId)
            .AsAsyncEnumerable();
        await foreach (var attachment in attachments) {
            attachment.Message = await db2.Messages.FindAsync(attachment.MessageId);
            // attachment.Message.Author = await db2.Users.FindAsync(attachment.Message.AuthorId);
            yield return attachment;
        }
    }
}