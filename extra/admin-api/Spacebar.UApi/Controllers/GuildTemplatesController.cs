using Microsoft.AspNetCore.Mvc;
using Spacebar.Interop.Authentication.AspNetCore;
using Spacebar.Models.Db.Contexts;
using Spacebar.UApi.Models;
using Spacebar.UApi.Services;

namespace Spacebar.UApi.Controllers;

[ApiController]
public class GuildTemplatesController(ILogger<GuildMembersController> logger, SpacebarDbContext db, SpacebarAspNetAuthenticationService authService, TemplateImportService importService) : ControllerBase {
    [HttpPost("/api/v10/guilds/templates/{templateId}")]
    public async Task UseTemplate(string templateId, UseGuildTemplateRequest request) {
        var user = await authService.GetCurrentUserAsync(Request);
        await importService.CreateGuildFromTemplateById(templateId, request, user);
    }
}