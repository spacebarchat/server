#!/usr/bin/env dotnet
#:property Nullable=enable
#:property PublishAOT=false
#:package ArcaneLibs@1.0.1-preview.20260616-220331

using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using ArcaneLibs;
using ArcaneLibs.Attributes;
using ArcaneLibs.Extensions;

var logJson = false;

var importErrors = new Dictionary<string, List<ImportReference>>();

void LogError(string fileName, ImportReference import)
{
    importErrors.GetOrCreate(fileName).Add(import);
    Console.Write(
        $"\n{ConsoleUtils.ColoredString("!", 255, 49, 49)} {ConsoleUtils.ColoredString(fileName + ":" + import.Line + ":" + import.Position, 49 + 128, 49 + 128, 255)}: {(logJson ? import.ToJson(indent: false) : import.ToColorizedString())}");
}

foreach (var f in ReadDirRecursive("./src"))
{
    if (f.EndsWith(".test.ts"))
    {
    }
    else
        await foreach (var import in GetImports(f))
        {
            // if (import.ImportSourceType == ImportSourceType.Npm)
            // Console.WriteLine(import.ToJson(indent: false));

            // file level
            if (f == "./src/schemas/Validator.ts")
            {
                if (import is not { ImportSource: "ajv" or "ajv-formats" or "node:fs" or "node:path" })
                    LogError(f, import);
            }

            //directory level
            else if (f.StartsWith("./src/extensions"))
            {
                if (import.ImportSourceType == ImportSourceTypeValue.LocalPath) continue;
                LogError(f, import);
            }
            else if (f.StartsWith("./src/database"))
            {
                if (import.ImportSource == "typeorm"
                    || import.ImportSourceType == ImportSourceTypeValue.LocalPath
                    || import.ImportSource == "node:crypto"
                    || (import.ImportSource == "schemas" && import.IsTypeImport)
                    || (import.ImportSource == "../Database") // maybe?
                   )
                    continue;
                LogError(f, import);
            }
            else if (f.StartsWith("./src/schemas"))
            {
                LogError(f, import);
            }
            else
            {
            }
        }

    if (importErrors.ContainsKey(f)) Console.Write("\n");
}

if (importErrors.Any())
    Console.WriteLine($"\rFinished with {importErrors.Sum(x => x.Value.Count)} warnings...\e[K");

Console.WriteLine();
// await foreach (var import in GetImports("./src/apply-migrations.ts"))
// {
//     Console.WriteLine(import.ToJson(indent: false));
// }

IEnumerable<string> ReadDirRecursive(string path)
{
    foreach (var f in Directory.GetFiles(path).OrderBy(x=>x.TrimEnd(".ts").ToString()))
        yield return f;

    foreach (var d in Directory.GetDirectories(path).Order())
    foreach (var f in ReadDirRecursive(d))
        yield return f;
}

async IAsyncEnumerable<ImportReference> GetImports(string path)
{
    var basicImportRegex = new Regex(
        @"^import (?<typeSpecifier>type )?{?(?<entities>[a-zA-Z ,\n]+)}? from ""(?<source>.*)"";",
        RegexOptions.Multiline
    );
    var basicRequireRegex = new Regex(
        @"require\(""(?<source>.*)""\)",
        RegexOptions.Multiline
    );
    // Console.WriteLine(basicImportRegex);

    Console.Write($"\rReading imports for {path}: \e[K");
    var fileContents = await File.ReadAllTextAsync(path);
    Console.Write($"{fileContents.Length} chars");

    // if (basicImportRegex.IsMatch(fileContents)) Console.WriteLine("Match!");
    // else Console.WriteLine(fileContents + "\n^ Did not match regex " + basicImportRegex);

    ImportSourceTypeValue ClassifyImportSourceType(string p)
    {
        if (p.StartsWith("node:")) return ImportSourceTypeValue.Node;
        if (p.StartsWith("@types/")) return ImportSourceTypeValue.Types;
        if (p.StartsWith("@spacebar/")) return ImportSourceTypeValue.SpacebarAlias;
        if (p.StartsWith("lambert-server")) return ImportSourceTypeValue.VendoredModule;
        if (p.StartsWith("../")) return ImportSourceTypeValue.Path;
        if (p.StartsWith("./")) return ImportSourceTypeValue.LocalPath;

        return ImportSourceTypeValue.Npm;
    }

    ImportReference GetRef(Match m, bool isRequire) => new()
    {
        IsRequire = isRequire,
        IsTypeImport = m.Groups.ContainsKey("typeSpecifier") && m.Groups["typeSpecifier"].Success,
        ImportEntities = m.Groups["entities"].Value.ReplaceLineEndings("").Replace(" ", "").Split(","),
        ImportSource = m.Groups["source"].Value,
        ImportSourceType = ClassifyImportSourceType(m.Groups["source"].Value),
        Line = fileContents[..(m.Index)].CountInstances("\n"),
        Position = m.Index - fileContents[..(m.Index)].LastIndexOf('\n')
    };

    foreach (Match m in basicImportRegex.Matches(fileContents))
        yield return GetRef(m, false);

    foreach (Match m in basicRequireRegex.Matches(fileContents))
        yield return GetRef(m, true);
}

struct ImportReference
{
    public int Line { get; set; }
    public int Position { get; set; }
    public bool IsTypeImport { get; set; }
    public bool IsRequire { get; set; }
    public string[] ImportEntities { get; set; }
    public string ImportSource { get; set; }
    public ImportSourceTypeValue ImportSourceType { get; set; }

    public override string ToString()
    {
        var sourceType = ImportSourceType;
        return
            $"{ImportSourceType.GetType().GetMember((sourceType.ToString())).First().GetFriendlyName()} {(IsRequire ? "require" : "import")} from {ImportSource}, obtaining {string.Join(", ", ImportEntities)}";
    }

    public string ToColorizedString()
    {
        var sourceType = ImportSourceType.GetType().GetMember((ImportSourceType.ToString())).First();
        var sourceTypeClr = sourceType.GetColorOrNull();
        return
            $"{ConsoleUtils.ColoredString(sourceType.GetFriendlyName(), sourceTypeClr?.R ?? 255, sourceTypeClr?.G ?? 255, sourceTypeClr?.B ?? 255)} "
            + $"{(IsRequire ? ConsoleUtils.ColoredString("require", 255, 255, 0) : ConsoleUtils.ColoredString("import", 0, 255, 0))} "
            + $"from {ConsoleUtils.ColoredString(ImportSource, sourceTypeClr?.R ?? 255, sourceTypeClr?.G ?? 255, sourceTypeClr?.B ?? 255)}, "
            + $"obtaining {(IsRequire ? "<unknown>" : string.Join(", ", ImportEntities.Select(x => ConsoleUtils.ColoredString(x, 150, 150, 150))))}";
    }
}

enum ImportType
{
    Unknown,
    Import,
    ImportType,
    Require
}

[JsonConverter(typeof(JsonStringEnumConverter<ImportSourceTypeValue>))]
enum ImportSourceTypeValue
{
    Unknown,

    [FriendlyName(Name = "NPM")] [Color(203, 56, 55)]
    Npm,

    [FriendlyName(Name = "NodeJS")] [Color(60, 135, 58)]
    Node,

    [FriendlyName(Name = "Types")] [Color(49, 120, 198)]
    Types,

    [FriendlyName(Name = "Spacebar internals")] [Color(11, 133, 255)]
    SpacebarAlias,

    [FriendlyName(Name = "Vendored module")] [Color(127, 255, 0)]
    VendoredModule,

    [FriendlyName(Name = "File path")] [Color(0, 255, 0)]
    Path,

    [Color(255, 255, 0)] [FriendlyName(Name = "Local file path")]
    LocalPath,
}