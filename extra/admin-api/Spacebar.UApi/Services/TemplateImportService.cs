using Spacebar.Models.Db.Contexts;
using Spacebar.Models.Db.Models;
using Spacebar.UApi.Models;

namespace Spacebar.UApi.Services;

public class TemplateImportService(SpacebarDbContext db) {
    public async Task<string> CreateGuildFromTemplateById(string templateId, UseGuildTemplateRequest request, User user) {
        return "";
    }
    
    // public async Task<>
}