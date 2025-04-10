using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminApi.Models;
using Spacebar.Db.Contexts;
using Spacebar.Db.Models;
using Spacebar.RabbitMqUtilities;

namespace Spacebar.AdminAPI.Controllers.Media;

[ApiController]
[Route("/media/user")]
public class UserMediaController(ILogger<UserMediaController> logger, SpacebarDbContext db, RabbitMQService mq, IServiceProvider sp) : ControllerBase {

    [HttpGet("{userId}/attachments")]
    public async IAsyncEnumerable<Attachment> GetAttachmentsByUser(string userId) {
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