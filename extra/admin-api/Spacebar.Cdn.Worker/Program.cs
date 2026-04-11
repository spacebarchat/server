using System.Globalization;
using ImageMagick;
using Spacebar.AdminApi.TestClient.Services.Helpers;
using Spacebar.AdminApi.TestClient.Services.Services;
using Spacebar.Cdn.Worker;
using Spacebar.Interop.Cdn.Abstractions;

var builder = WebApplication.CreateBuilder(args);

// var sw = Stopwatch.StartNew();
Console.WriteLine("Pre-initializing Magick.NET...");
// OpenCL.IsEnabled = true;
MagickNET.Initialize();
// Console.WriteLine("==> Rendering default avatars...");
// foreach (var (r, g, b) in DefaultAvatarRenderer.DefaultAvatarColors) {
//     var res = await DefaultAvatarRenderer.GetDefaultAvatar(r, g, b, size: 4096);
//     Console.WriteLine($"  ==> #{r:X2}{g:X2}{b:X2} => {res.Length} bytes");
//     res.Position = 0;
//     await using (var fs = File.OpenWrite($"default-{r:X2}{g:X2}{b:X2}.png")) {
//         await res.CopyToAsync(fs);
//         fs.Flush();
//         fs.Close();
//     }
// }

// byte skip = 8;
// var re = new RainbowEnumerator(lengthFactor: 256, skip: skip);
// var reFg = new RainbowEnumerator(lengthFactor: 512, skip: skip, offset: 128);
// var magickCollection = new MagickImageCollection();
// for (int i = 0; i < 255; i += skip) {
//     var sw2 = Stopwatch.StartNew();
//     var clr = re.Next();
//     var clrFg = reFg.Next();
//     var res = await DefaultAvatarRenderer.GetDefaultAvatarImage(clr.r, clr.g, clr.b, clrFg.r, clrFg.g, clrFg.b, size: 512);
//     Console.Write($"  ==> #{clr.r:X2}{clr.g:X2}{clr.b:X2}/{clrFg.r:X2}{clrFg.g:X2}{clrFg.b:X2} ({i} => {magickCollection.Count + 1})... R");
//     res.Flatten();
//     Console.Write("F");
//     res.First().AnimationDelay = 4;
//     Console.Write("A");
//     magickCollection.Add(res.First());
//     Console.WriteLine(" => " + sw2.Elapsed);
// }
//
// Console.WriteLine("  ==> Optimizing (1/2)...");
// magickCollection.OptimizePlus();
// Console.WriteLine("  ==> Optimizing (2/2)...");
// magickCollection.OptimizeTransparency();
// Console.WriteLine("  ==> Writing...");
// await using (var fs = File.OpenWrite($"default-animated.gif")) {
//     await magickCollection.WriteAsync(fs, MagickFormat.Gif);
// }
//
// Console.WriteLine(sw.Elapsed);
// Environment.Exit(0);

// builder.WebHost.ConfigureKestrel(opts => opts.ListenUnixSocket(Environment.GetEnvironmentVariable("SOCKET_PATH")!));

builder.Services.AddSingleton<IFileSource>(await new FilesystemFileSource(Environment.GetEnvironmentVariable("STORAGE_PATH") ?? throw new InvalidOperationException("STORAGE_PATH not set!")).Init());
builder.Services.AddSingleton<DiscordImageResizeService>();

builder.Services.AddControllers();
var app = builder.Build();
app.MapControllers();

app.MapGet("/defaultAvatar/{idx:int}.{ext}", async (HttpContext ctx, int idx, string ext) => {
    var (r, g, b) = DefaultAvatarRenderer.DefaultAvatarColors[idx % DefaultAvatarRenderer.DefaultAvatarColors.Length];
    var res = await DefaultAvatarRenderer.GetDefaultAvatar(r, g, b, size: ctx.Request.Query.ContainsKey("size") ? int.Parse(ctx.Request.Query["size"]!) : 4096,
        format: Mimes.GetFormatForExtension(ext));
    return Results.File(res, Mimes.GetMime(Mimes.GetFormatForExtension(ext)));
});

// small easter egg internal stuff, maybe used someday :)
app.MapGet("/defaultAvatar/_{bg:length(6)}.{ext}", async (HttpContext ctx, string bg, string ext) => {
    var (r, g, b) = (byte.Parse(bg[..2], NumberStyles.HexNumber), byte.Parse(bg[2..4], NumberStyles.HexNumber), byte.Parse(bg[4..6], NumberStyles.HexNumber));
    var res = await DefaultAvatarRenderer.GetDefaultAvatar(r, g, b, size: ctx.Request.Query.ContainsKey("size") ? int.Parse(ctx.Request.Query["size"]!) : 4096,
        format: Mimes.GetFormatForExtension(ext));
    return Results.File(res, Mimes.GetMime(Mimes.GetFormatForExtension(ext)));
});

app.MapGet("/defaultAvatar/_{bg:length(6)}_{fg:length(6)}.{ext}", async (HttpContext ctx, string bg, string fg, string ext) => {
    var (r, g, b) = (byte.Parse(bg[..2], NumberStyles.HexNumber), byte.Parse(bg[2..4], NumberStyles.HexNumber), byte.Parse(bg[4..6], NumberStyles.HexNumber));
    var (rf, gf, bf) = (byte.Parse(fg[..2], NumberStyles.HexNumber), byte.Parse(fg[2..4], NumberStyles.HexNumber), byte.Parse(fg[4..6], NumberStyles.HexNumber));
    var res = await DefaultAvatarRenderer.GetDefaultAvatar(r, g, b, rf, gf, bf, size: ctx.Request.Query.ContainsKey("size") ? int.Parse(ctx.Request.Query["size"]!) : 4096,
        format: Mimes.GetFormatForExtension(ext));
    return Results.File(res, Mimes.GetMime(Mimes.GetFormatForExtension(ext)));
});

app.MapGet("/scale/{*path}", async (HttpContext ctx, IFileSource ifs, DiscordImageResizeService dirs, string path) => {
    var f = await ifs.GetFile(path);
    f.Stream.Position = 0;
    var res = dirs.Apply(new MagickImageCollection(f.Stream), ctx.Request.GetResizeParams());
    await ctx.Response.StartAsync();
    await res.WriteAsync(ctx.Response.Body);
    await ctx.Response.CompleteAsync();
});

app.Run();