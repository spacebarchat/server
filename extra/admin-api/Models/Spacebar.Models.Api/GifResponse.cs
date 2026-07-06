using System.Text.Json.Serialization;

namespace Spacebar.Models.Api;

public class GifItem {
    [JsonPropertyName("id")]
    public string Id { get; set; }

    [JsonPropertyName("title"), Obsolete("Deprecated")]
    public string? Title { get; set; }
    
    [JsonPropertyName("url")]
    public string Url { get; set; }
    
    [JsonPropertyName("src")]
    public string Source { get; set; }
    
    [JsonPropertyName("gif_src")]
    public string GifSource { get; set; }
    
    [JsonPropertyName("preview")]
    public string Preview { get; set; }
    
    [JsonPropertyName("width")]
    public int Width { get; set; }
    
    [JsonPropertyName("height")]
    public int Height { get; set; }
}

public class TrendingGifsResult {
    [JsonPropertyName("categories")]
    public List<CategoryEntry> Categories { get; set; }
    
    [JsonPropertyName("gifs")]
    public List<GifItem> Gifs { get; set; }

    public class CategoryEntry {
        [JsonPropertyName("name")]
        public string Name { get; set; }
        
        [JsonPropertyName("src")]
        public string Source { get; set; }
    }
}