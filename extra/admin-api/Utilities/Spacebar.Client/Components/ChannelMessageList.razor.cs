using System.Text.RegularExpressions;

namespace Spacebar.Client.Components;

public partial class ChannelMessageList {
    [GeneratedRegex(@"\*\*(.*)\*\*")]
    private static partial Regex MarkdownBoldRegex { get; }
    
    [GeneratedRegex(@"\*(.*)\*")]
    private static partial Regex MarkdownItalicRegex { get; }

    [GeneratedRegex(@"```((?<lang>.*)\n)(?<content>.*)```")]
    private static partial Regex MarkdownCodeblockRegex { get; }
    
    [GeneratedRegex(@"``?(.*)`?`")]
    private static partial Regex MarkdownCodeRegex { get; }
    
    [GeneratedRegex(@"<#(\d*)>")]
    private static partial Regex MarkdownChannelMentionRegex { get; }
    
    [GeneratedRegex(@"<@(\d*)>")]
    private static partial Regex MarkdownUserMentionRegex { get; }
    
    [GeneratedRegex(@"<@&(\d*)>")]
    private static partial Regex MarkdownRoleMentionRegex { get; }
    
    [GeneratedRegex(@"<:(?<name>[a-zA-Z0-9]*?):(?<emojiId>\d*>)")]
    private static partial Regex MarkdownEmojiMentionRegex { get; }

}