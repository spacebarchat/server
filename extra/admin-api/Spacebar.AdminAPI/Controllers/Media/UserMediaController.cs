using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminAPI.Extensions;
using Spacebar.AdminApi.Models;
using Spacebar.AdminAPI.Services;
using Spacebar.Db.Contexts;
using Spacebar.Db.Models;
using Spacebar.RabbitMqUtilities;

namespace Spacebar.AdminAPI.Controllers.Media;

[ApiController]
[Route("/media/user")]
public class UserMediaController(ILogger<UserMediaController> logger, SpacebarDbContext db, RabbitMQService mq, AuthenticationService auth, IServiceProvider sp) : ControllerBase {
    [HttpGet("{userId}/attachments")]
    public async IAsyncEnumerable<Attachment> GetAttachmentsByUser(string userId) {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);
        
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