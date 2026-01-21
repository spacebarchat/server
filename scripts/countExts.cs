#!/usr/bin/env dotnet
#:property Nullable=enable
#:property PublishAOT=false
#:package ArcaneLibs@1.0.0-preview.20251207*

using ArcaneLibs;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;

if(args.Length == 0)
{
    Console.WriteLine("Usage: countExts [options] <directory_path>");
    Console.WriteLine("Options:");
    Console.WriteLine("  --size         Sort by total size per extension (descending)");
    Console.WriteLine("  --real-size    Sort by estimated disk usage per extension (descending)");
    Console.WriteLine("  --ext          Sort by extension name (ascending)");
    Console.WriteLine("  --count        Sort by file count per extension (ascending)");
    Console.WriteLine("  --by-filename  Use full filename instead of extension for counting");
    Console.WriteLine("  --double-ext   Consider double extensions (e.g., .test.js)");
    Console.WriteLine("  --filename-fallback  Use full filename as extension if no extension found");
    return;
}

// undo chdir by dotnet
Environment.CurrentDirectory = Environment.GetEnvironmentVariable("PWD") ?? Environment.CurrentDirectory;

Dictionary<string, int> extCounts = [];
Dictionary<string, long> extSizes = [];
Dictionary<string, long> extRealSizes = [];
long totalSize = 0;
long totalRealSize = 0;

void CountExtensions(string path)
{
    foreach (var file in Directory.GetFiles(path))
    {
        string ext = args.Contains("--by-filename") ? Path.GetFileName(file).ToLower() : Path.GetExtension(file).ToLower();

        // handle double extensions, ie. .test.js, .min.js etc
        if (args.Contains("--double-ext") && Path.GetFileName(file).Count(c => c == '.') >= 2)
        {
            var fname = Path.GetFileNameWithoutExtension(file);
            var secondExt = Path.GetExtension(fname).ToLower();
            if (!string.IsNullOrEmpty(secondExt))
                ext = secondExt + ext;
        }

        if(string.IsNullOrEmpty(ext))
            ext = args.Contains("--filename-fallback") ? Path.GetFileName(file).ToLower() : "<no_ext>";

        if (!extCounts.ContainsKey(ext))
            extCounts[ext] = 0;
        extCounts[ext]++;

        var fi = new FileInfo(file);
        if (!extSizes.ContainsKey(ext))
            extSizes[ext] = 0;
        extSizes[ext] += fi.Length;
        totalSize += fi.Length;

        // Assuming 4KiB block size
        if (!extRealSizes.ContainsKey(ext))
            extRealSizes[ext] = 0;
        extRealSizes[ext] += (((fi.Length + 4095) / 4096) * 4096);
        totalRealSize += (((fi.Length + 4095) / 4096) * 4096);
    }

    foreach (var dir in Directory.GetDirectories(path)) CountExtensions(dir);
}

CountExtensions(args.First(a=>!a.StartsWith("--")));
var extColWidth = extCounts.Max(k => k.Key.Length) + 1;
var numColWidth = extCounts.Max(k=>k.Value.ToString().Length) + 1;

var sortedExts = extCounts.OrderByDescending(kvp => kvp.Value);

if (args.Contains("--size"))
    sortedExts = extCounts.OrderByDescending(kvp => extSizes[kvp.Key]);
if (args.Contains("--real-size"))
    sortedExts = extCounts.OrderByDescending(kvp => extRealSizes[kvp.Key]);
if (args.Contains("--ext"))
    sortedExts = extCounts.OrderBy(kvp => kvp.Key);
if (args.Contains("--count"))
    sortedExts = extCounts.OrderBy(kvp => kvp.Value);

foreach (var kvp in sortedExts) Console.WriteLine($"{kvp.Value.ToString().PadLeft(numColWidth)} {kvp.Key.PadRight(extColWidth)} Total Size: {Util.BytesToString(extSizes[kvp.Key]).PadRight(12)} Est. usage: {Util.BytesToString(extRealSizes[kvp.Key])}");

Console.WriteLine($"\nTotal unique extensions: {extCounts.Count}");
Console.WriteLine($"Total disk usage: {Util.BytesToString(totalSize)} (est. usage: {Util.BytesToString(totalRealSize)})");