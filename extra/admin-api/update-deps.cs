#! /usr/bin/env dotnet
#:property Nullable=enable
#:property PublishAOT=false
#:package ArcaneLibs@1.0.0-preview.20251207*

using ArcaneLibs;
using ArcaneLibs.Extensions;
using System.Text.Json;

ProjectDef[] projects = [
    new("Spacebar-Models-AdminApi", "Models/Spacebar-Models-AdminApi"),
    new("Spacebar-Models-Config", "Models/Spacebar-Models-Config"),
    new("Spacebar-Models-Db", "Models/Spacebar-Models-Db"),
    new("Spacebar-Interop-Replication-Abstractions", "Interop/Spacebar-Interop-Replication-Abstractions"),
    new("Spacebar-Interop-Replication-RabbitMq", "Interop/Spacebar-Interop-Replication-RabbitMq"),
    new("Spacebar-Interop-Replication-UnixSocket", "Interop/Spacebar-Interop-Replication-UnixSocket"),
    new("Spacebar-CleanSettingsRows", "Utilities/Spacebar-CleanSettingsRows"),
    new("Spacebar-AdminApi", "Spacebar-AdminApi"),
    new("Spacebar-Cdn", "Spacebar-Cdn"),
];

Console.WriteLine("==> Getting outputs...");
var outs = JsonSerializer.Deserialize<string[]>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux --apply builtins.attrNames", silent: true, stderr: false));
Console.WriteLine("==> Updating project dependencies...");


// foreach (var proj in projects) {
//     Console.WriteLine(ConsoleUtils.ColoredString($"  ==> Updating {proj.NixName} ({proj.Path})", 0x80, 0x80, 0xff));
//     Console.Write(ConsoleUtils.ColoredString($"    ==> Getting project files... ", 0x80, 0xff, 0xff));
//     var projectFiles = JsonSerializer.Deserialize<string[]>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux.{proj.NixName}.dotnetProjectFiles", silent: true, stderr: false));
//     Console.WriteLine(ConsoleUtils.ColoredString($"{string.Join(", ", projectFiles)}", 0x80, 0xff, 0xff));
//     if (projectFiles.Length != 1) throw new Exception("Invalid project file count?");
//     // Util.RunCommandSync("nix", $"build .#{proj.NixName}.passthru.fetch-deps");
//     // await Task.Delay(250);
// }

foreach (var outp in outs) {
    Console.WriteLine(ConsoleUtils.ColoredString($"  ==> Updating {outp}...", 0x80, 0x80, 0xff));
    Console.Write(ConsoleUtils.ColoredString($"    ==> Getting project files... ", 0x80, 0xff, 0xff));
    var projectFiles = JsonSerializer.Deserialize<string[]>(Util.GetCommandOutputSync("nix", $"eval --json .#packages.x86_64-linux.{outp}.dotnetProjectFiles", silent: true, stderr: false));
    Console.WriteLine(ConsoleUtils.ColoredString($"{string.Join(", ", projectFiles)}", 0x80, 0xff, 0xff));
    if (projectFiles.Length != 1) throw new Exception("Invalid project file count?");

    var nugetDepsFilePath = Path.Combine(Path.GetDirectoryName(projectFiles[0]), "deps.json");
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



public record ProjectDef(string NixName, string Path);
