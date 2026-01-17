using System.Text.Json.Nodes;
using Spacebar.ConfigModel.Extensions;
using Spacebar.Models.Db.Contexts;

namespace ConfigTest;

public class Worker(ILogger<Worker> logger, SpacebarDbContext db) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var config = db.Configs
            .OrderBy(x => x.Key)
            .ToDictionary(x => x.Key, x => x.Value);
        foreach (var (key, value) in config)
        {
            Console.WriteLine("Config Key: {0}, Value: {1}", key, value ?? "[NULL]");
        }

        var readConfig = config.ToNestedJsonObject();
        Console.WriteLine(readConfig);
        var mapped = readConfig.ToFlatKv();
        foreach (var (key, value) in mapped)
        {
            Console.WriteLine("Mapped Key: {0}, Value: {1}", key, value ?? "[NULL]");
        }
        
        // check that they're equal
        foreach (var (key, value) in config)
        {
            if (!mapped.ContainsKey(key))
            {
                Console.WriteLine("Missing Key in Mapped: {0}", key);
                continue;
            }

            if (mapped[key] != value)
            {
                Console.WriteLine("Value Mismatch for Key: {0}, Original: {1}, Mapped: {2}", key, value ?? "[NULL]", mapped[key] ?? "[NULL]");
            }
        }
        Environment.Exit(0);
    }
}