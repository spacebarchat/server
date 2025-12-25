// See https://aka.ms/new-console-template for more information

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using ArcaneLibs.Extensions;
using DiscordEmojiConverter;

var emojis = JsonSerializer.Deserialize<DiscordEmojiJson>(File.OpenRead(args[0]),
    new JsonSerializerOptions() { UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow });

emojis.SurrogateToEmoji = null;
emojis.NameToEmoji = null;
emojis.NumDiversitySprites = null;
emojis.NumNonDiversitySprites = null;

foreach (var emoji in emojis.Emojis!)
{
    emoji.HasDiversity = null;
    emoji.HasDiversityParent = null;
    emoji.HasMultiDiversity = null;
    emoji.HasMultiDiversityParent = null;
    emoji.SpriteIndex = null;
    emoji.UnicodeVersion = null;
}

Console.WriteLine(emojis.ToJson(ignoreNull: true, indent: false));