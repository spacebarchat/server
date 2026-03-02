using Microsoft.AspNetCore.Mvc;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;
using Spacebar.UApi.Controllers.Messages;
using Spacebar.UApi.Services;
using Config = Spacebar.ConfigModel.Config;

namespace Spacebar.UApi.Controllers;

[ApiController]
[Route("/api/v{_}/guilds/{guildId}/stickers/")]
public class GuildStickerController(ILogger<MessagesController> logger, SpacebarDbContext db, SpacebarAspNetAuthenticationService authService, UApiConfiguration cfg, PermissionService permService, Config sbCfg) : ControllerBase {
    // TODO proper response type
    // [HttpPost]
    // public async Task<Sticker> UploadGuildSticker(string guildId, MultipartFormDataContent content) {
    //     
    //     var sticker = new Sticker() {
    //         GuildId = guildId
    //     };
    //
    //     foreach (var item in content) {
    //         switch (item.Headers.ContentDisposition.Name.Trim('"')) {
    //             case "name":
    //                 sticker.Name = await item.ReadAsStringAsync();
    //                 break;
    //             case "description": 
    //                 sticker.Description = await item.ReadAsStringAsync();
    //                 break;
    //             case "tags": 
    //                 sticker.Tags = await item.ReadAsStringAsync();
    //                 break;
    //             case "file":
    //                 var fileContent = await item.ReadAsStreamAsync();
    //                 
    //                 break;
    //         }
    //     }
    //
    //     return sticker;
    // }
}