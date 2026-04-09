#! /usr/bin/env dotnet
#:property Nullable=enable
#:property PublishAOT=false
#:package ArcaneLibs@1.0.0-preview.20251207*

using ArcaneLibs;
using ArcaneLibs.Extensions;
using System.Text.Json;

// sync versions for CDN worker
{
    Console.WriteLine("==> Ensuring CDN worker dependencies are in sync...");
    var origContent = await File.ReadAllTextAsync("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q16-HDRI.x86_64.csproj");
    var depToReplace = "Magick.NET-Q16-HDRI-OpenMP-x64";
    (string Project, string Dependency)[] replaceTargets = [
        // ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q16-HDRI.x86_64.csproj", "Magick.NET-Q16-HDRI-OpenMP-x64"), // source
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q16.x86_64.csproj", "Magick.NET-Q16-OpenMP-x64"),
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q8.x86_64.csproj", "Magick.NET-Q8-OpenMP-x64"),
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q16-HDRI.aarch64.csproj", "Magick.NET-Q16-HDRI-OpenMP-arm64"),
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q16.aarch64.csproj", "Magick.NET-Q16-OpenMP-arm64"),
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q8.aarch64.csproj", "Magick.NET-Q8-OpenMP-arm64"),
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q16-HDRI.AnyCPU.csproj", "Magick.NET-Q16-HDRI-AnyCPU"),
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q16.AnyCPU.csproj", "Magick.NET-Q16-AnyCPU"),
        ("Spacebar.Cdn.Worker/Spacebar.Cdn.Worker.Q8.AnyCPU.csproj", "Magick.NET-Q8-AnyCPU"),
    ];

    foreach (var target in replaceTargets) {
        Console.WriteLine($"  ==> {target.Project} -> {target.Dependency}");
        await File.WriteAllTextAsync(target.Project, origContent.Replace(depToReplace, target.Dependency));
    }
}

Console.WriteLine("==> Getting outputs...");
var outs = JsonSerializer.Deserialize<string[]>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux --apply builtins.attrNames", silent: true, stderr: false));
if (args.Length > 0) {
    var filter = args[0];
    outs = outs.Where(x => x.Contains(filter)).ToArray();
}

Console.WriteLine($"==> Updating dependencies for {outs.Length} projects...");

var ss = new SemaphoreSlim(1, 1);
var idx = 0;
var tasks = outs.Select(outp => Task.Run(async () => {
    await ss.WaitAsync();
    try {
        Console.WriteLine(ConsoleUtils.ColoredString($"  ==> Updating {outp}...", 0x80, 0x80, 0xff));
        Console.Write(ConsoleUtils.ColoredString($"    ==> Getting project root directory... ", 0x80, 0xff, 0xff));
        var rootDir = JsonSerializer.Deserialize<string>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux.{outp}.srcRoot", silent: true, stderr: false))
            .Split("/extra/admin-api/", 2)[1];
        var depsFileStorePath = JsonSerializer.Deserialize<string>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux.{outp}.__nugetDeps", silent: true, stderr: false));
        var depsFileName = new FileInfo(depsFileStorePath).Name;
        Console.Write(ConsoleUtils.ColoredString($"{rootDir}", 0x80, 0xff, 0xff));
        Console.Write(" - ");
        Console.Write(ConsoleUtils.ColoredString($"{depsFileStorePath} ", 0x80, 0x80, 0xff));
        Console.WriteLine(ConsoleUtils.ColoredString($"({depsFileName})", 0x80, 0xff, 0x80));

        if (rootDir.Length <= 1) throw new Exception("Invalid project file count?");

        var nugetDepsFilePath = Path.Combine(rootDir, depsFileName);
        Console.WriteLine(ConsoleUtils.ColoredString($"    ==> {nugetDepsFilePath} exists: {File.Exists(nugetDepsFilePath)}", 0x80, 0xff, 0xff));
        if (!File.Exists(nugetDepsFilePath)) {
            Console.WriteLine(ConsoleUtils.ColoredString($"      ==> No NuGet deps file, skipping!", 0xff, 0x80, 0x80));
            return;
        }

        if (idx == 1) await Task.Delay(3000); // give the first one a bit of time to eval...
        await Task.Delay(idx++ * 1500);

        var fname = $"./update-deps-{outp}";
        Console.WriteLine(ConsoleUtils.ColoredString($"      ==> Building fetch-deps script {fname}...", 0x80, 0xff, 0x80));
        RunCommandSync("nix", $"build .#{outp}.passthru.fetch-deps --out-link {fname}");

        Console.WriteLine(ConsoleUtils.ColoredString($"      ==> Running fetch-deps script, writing into {nugetDepsFilePath}...", 0x80, 0xff, 0x80));
        RunCommandSync(fname, nugetDepsFilePath);

        var deps = JsonSerializer.Deserialize<object[]>(await File.ReadAllTextAsync(nugetDepsFilePath));
        Console.WriteLine(ConsoleUtils.ColoredString($"      ==> Locked {deps.Length} dependencies for {outp}...", (byte)(deps.Length == 0 ? 0xff : 0x80),
            (byte)(deps.Length == 0 ? 0x80 : 0xff), 0x80));
        // File.Delete(fname);
        // await Task.Delay(250);
    }
    finally {
        ss.Release();
    }
})).ToList();

await Task.WhenAll(tasks);

static void RunCommandSync(string command, string args = "", bool silent = false) {
    Console.WriteLine($"Executing command (silent: {silent}): {command} {args}");
    Util.RunCommandSync(command, args,silent);
}