using System.Collections.Immutable;
using ArcaneLibs.Extensions.Streams;
using Microsoft.AspNetCore.Mvc;
using Spacebar.AdminApi.TestClient.Services.Services;
using Spacebar.Cdn.Extensions;
using Spacebar.Interop.Cdn.Abstractions;

namespace Spacebar.Cdn.Controllers;

[ApiController]
public class StaticAssetController(LruFileCache lfc, IFileSource fs, DiscordImageResizeService dirs) : ImageController {
    private static readonly Dictionary<string, string> defaultAvatarHashMap = new() {
        { "0", "4a8562cf00887030c416d3ec2d46385a" },
        { "1", "9b0bb198936784c45c72833cc426cc55" },
        { "2", "22341bdb500c7b63a93bbce957d1601e" },
        { "3", "d9977836b82058bf2f74eebd50edc095" },
        { "4", "9d6ddb4e4d899a533a8cc617011351c9" },
        { "5", "7213ab6677377974697dfdfbaf5f6a6f" },
    };

    private static readonly Dictionary<string, string> defaultGroupDMAvatarHashMap = new() {
        { "0", "3b70bb66089c60f8be5e214bf8574c9d" },
        { "1", "9581acd31832465bdeaa5385b0e919a3" },
        { "2", "a8a4727cf2dc2939bd3c657fad4463fa" },
        { "3", "2e46fe14586f8e95471c0917f56726b5" },
        { "4", "fac7e78de9753d4a37083bba74c1d9ef" },
        { "5", "4ab900144b0865430dc9be825c838faa" },
        { "6", "1276374a404452756f3c9cc2601508a5" },
        { "7", "904bf9f1b61f53ef4a3b7a893afeabe3" },
    };
    // [HttpGet("/embed/avatars/{userIndex}")]
    // public async Task<IActionResult> GetDefaultUserAvatar(string userIndex) {
    //     
    // }
}