#! /usr/bin/env dotnet
#:property Nullable=enable
#:property PublishAOT=false
#:package ArcaneLibs@1.0.0-preview.20251207*

using ArcaneLibs;
using ArcaneLibs.Extensions;
using System.Text.Json;

Console.WriteLine("==> Getting outputs...");
var outs = JsonSerializer.Deserialize<string[]>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux --apply builtins.attrNames", silent: true, stderr: false));
if (args.Length > 0) {
    var filter = args[0];
    outs = outs.Where(x => x.Contains(filter)).ToArray();
}

Console.WriteLine($"==> Updating dependencies for {outs.Length} projects...");

foreach (var outp in outs) {
    Console.WriteLine(ConsoleUtils.ColoredString($"  ==> Updating {outp}...", 0x80, 0x80, 0xff));
    Console.Write(ConsoleUtils.ColoredString($"    ==> Getting project root directory... ", 0x80, 0xff, 0xff));
    var rootDir = JsonSerializer.Deserialize<string>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux.{outp}.srcRoot", silent: true, stderr: false)).Split("/extra/admin-api/",2)[1];
    Console.WriteLine(ConsoleUtils.ColoredString($"{rootDir}", 0x80, 0xff, 0xff));
    if (rootDir.Length <= 1) throw new Exception("Invalid project file count?");

    var nugetDepsFilePath = Path.Combine(rootDir, "deps.json");
    Console.WriteLine(ConsoleUtils.ColoredString($"    ==> {nugetDepsFilePath} exists: {File.Exists(nugetDepsFilePath)}", 0x80, 0xff, 0xff));
    if (!File.Exists(nugetDepsFilePath)) {
        Console.WriteLine(ConsoleUtils.ColoredString($"      ==> No NuGet deps file, skipping!", 0xff, 0x80, 0x80));
        continue;
    }

    Console.WriteLine(ConsoleUtils.ColoredString($"      ==> Building fetch-deps script...", 0x80, 0xff, 0x80));
    Util.RunCommandSync("nix", $"build .#{outp}.passthru.fetch-deps");

    Console.WriteLine(ConsoleUtils.ColoredString($"      ==> Running fetch-deps script...", 0x80, 0xff, 0x80));
    Util.RunCommandSync("./result", nugetDepsFilePath);

    var deps = JsonSerializer.Deserialize<object[]>(File.ReadAllText(nugetDepsFilePath));
    Console.WriteLine(ConsoleUtils.ColoredString($"      ==> Locked {deps.Length} dependencies...", (byte)(deps.Length == 0 ? 0xff : 0x80), (byte)(deps.Length == 0 ? 0x80 : 0xff), 0x80));


    // await Task.Delay(250);
}