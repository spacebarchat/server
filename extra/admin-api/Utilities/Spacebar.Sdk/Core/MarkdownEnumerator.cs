namespace Spacebar.Sdk.Core;

public class MarkdownEnumerator {
    public IEnumerable<BaseMarkdownNode> EnumerateMarkdownComponents(string text) {
        if (text.StartsWith("-#")) {
            var line = text.Split('\n')[0];
            text = text.Replace(line + "\n", "");
            yield return new ContainerMarkdownNode() {
                ComponentType = "sub",
                Contents = new MarkdownEnumerator().EnumerateMarkdownComponents(line[2..].TrimStart()).ToList()
            };
        }
        else if (text.StartsWith("#")) {
            var hdrLevel = text.TakeWhile(x => x == '#').Count();
            var line = text.Split('\n')[0];
            text = text.Replace(line + "\n", "");
            yield return new ContainerMarkdownNode() {
                ComponentType = "h" + hdrLevel,
                Contents = new MarkdownEnumerator().EnumerateMarkdownComponents(line[hdrLevel..].TrimStart()).ToList()
            };
        }
        yield return new InnerTextMarkdownNode(text);
    }
}

public class BaseMarkdownNode {
}

public class ContainerMarkdownNode : BaseMarkdownNode {
    public string ComponentType { get; set; }
    public List<BaseMarkdownNode> Contents { get; set; }
}

public class InnerTextMarkdownNode(string Text) : BaseMarkdownNode{
    public string Text { get; set; }
}
