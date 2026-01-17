using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Spacebar.AdminApi.Extensions;
using Spacebar.Models.AdminApi;
using Spacebar.AdminApi.Services;
using Spacebar.Models.Db.Contexts;

namespace Spacebar.AdminApi.Controllers.Media;

[ApiController]
[Route("/media/sticker")]
public class StickerController(ILogger<StickerController> logger, SpacebarDbContext db, AuthenticationService auth) : ControllerBase {
    [HttpGet("")]
    public async IAsyncEnumerable<StickerModel> GetStickers() {
        (await auth.GetCurrentUser(Request)).GetRights().AssertHasAllRights(SpacebarRights.Rights.OPERATOR);

        var stickers = db.Stickers
            .AsNoTracking()
            .IgnoreAutoIncludes()
            .AsAsyncEnumerable();

        await foreach (var sticker in stickers) {
            yield return new() {
                Id = sticker.Id,
                Name = sticker.Name,
                Description = sticker.Description,
                Available = sticker.Available,
                Tags = sticker.Tags,
                PackId = sticker.PackId,
                GuildId = sticker.GuildId,
                UserId = sticker.UserId,
                Type = sticker.Type,
                FormatType = sticker.FormatType,
            };
        }
    }
}