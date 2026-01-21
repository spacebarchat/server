#!/usr/bin/env dotnet
#:property Nullable=enable
#:property PublishAOT=false
#:package ArcaneLibs@1.0.0-preview.20251207*

using ArcaneLibs;
using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;

if(args.Length == 0)
{
    Console.WriteLine("Usage: countExts [options] <directory_path>");
    Console.WriteLine("Options:");
    Console.WriteLine("  --size         Sort by total size per extension (descending)");
    Console.WriteLine("  --real-size    Sort by estimated disk usage per extension (descending)");
    Console.WriteLine("  --count        Sort by file count per extension (ascending)");
    Console.WriteLine("  --name         Sort by extension name (ascending)");
    Console.WriteLine("  --reverse      Reverse the sort order");
    return;
}

// undo chdir by dotnet
Environment.CurrentDirectory = Environment.GetEnvironmentVariable("PWD") ?? Environment.CurrentDirectory;

Dictionary<string, long> dirSizes = [];
Dictionary<string, long> dirRealSizes = [];
Dictionary<string, int> dirCounts = [];
long totalSize = 0;
long totalRealSize = 0;

void GetDirSize(string path)
{
    long dirSize = 0;
    long realDirSize = 0;
    foreach (var file in Directory.GetFiles(path)) {
        var len = new FileInfo(file).Length;
        dirSize += len;
        // assuming 4KiB block size
        realDirSize += ((len + 4095) / 4096) * 4096;
    }

    // include filesystem entry sizes in real size
    Glibc.stat(path, out var statbuf);
    realDirSize += statbuf.st_size;

    totalSize += dirSize;
    totalRealSize += realDirSize;
    var dirName = Path.GetFileName(path).ToLower();

    if (!dirCounts.ContainsKey(dirName))
        dirCounts[dirName] = 0;
    dirCounts[dirName]++;

    if (!dirSizes.ContainsKey(dirName))
        dirSizes[dirName] = 0;
    dirSizes[dirName] += dirSize;

    if (!dirRealSizes.ContainsKey(dirName))
        dirRealSizes[dirName] = 0;
    dirRealSizes[dirName] += realDirSize;

    foreach (var dir in Directory.GetDirectories(path)) GetDirSize(dir);
}

GetDirSize(args.First(a=>!a.StartsWith("--")));
var extColWidth = dirCounts.Max(k => k.Key.Length) + 1;
var numColWidth = dirCounts.Max(k=>k.Value.ToString().Length) + 1;

IEnumerable<KeyValuePair<string, int>> sortedDirs = dirCounts.OrderByDescending(kvp => kvp.Value);

if (args.Contains("--size"))
    sortedDirs = dirCounts.OrderByDescending(kvp => dirSizes[kvp.Key]);
if (args.Contains("--real-size"))
    sortedDirs = dirCounts.OrderByDescending(kvp => dirRealSizes[kvp.Key]);
if (args.Contains("--ext"))
    sortedDirs = dirCounts.OrderBy(kvp => kvp.Key);
if (args.Contains("--count"))
    sortedDirs = dirCounts.OrderBy(kvp => kvp.Value);

if (args.Contains("--reverse"))
    sortedDirs = sortedDirs.Reverse();

if (args.Contains("--duplicate-only"))
    sortedDirs = sortedDirs.Where(kvp => kvp.Value > 1);

foreach (var kvp in sortedDirs) Console.WriteLine($"{kvp.Value.ToString().PadLeft(numColWidth)} {kvp.Key.PadRight(extColWidth)} Total Size: {Util.BytesToString(dirSizes[kvp.Key]).PadRight(12)} Est. usage: {Util.BytesToString(dirRealSizes[kvp.Key])}");

Console.WriteLine($"\nTotal unique directory names: {dirCounts.Count}");
Console.WriteLine($"Total disk usage: {Util.BytesToString(totalSize)} (est. usage: {Util.BytesToString(totalRealSize)})");

static class Glibc
{
    // to get filesystem entry size for directories
    [DllImport("libc", SetLastError = true)]
    public static extern int stat(string path, out Stat buf);
}

[StructLayout(LayoutKind.Sequential)]
public struct Stat
{
    public ulong st_dev;
    public ulong st_ino;
    public ulong st_nlink;
    public uint st_mode;
    public uint st_uid;
    public uint st_gid;
    public ulong st_rdev;
    public long st_size;
    public long st_blksize;
    public long st_blocks;
    public long st_atime;
    public ulong st_atime_nsec;
    public long st_mtime;
    public ulong st_mtime_nsec;
    public long st_ctime;
    public ulong st_ctime_nsec;
    public long __unused1;
    public long __unused2;
    public long __unused3;
}