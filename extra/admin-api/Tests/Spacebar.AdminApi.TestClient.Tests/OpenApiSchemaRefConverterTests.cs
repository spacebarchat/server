using System.Text.Json;
using System.Text.Json.Nodes;
using Spacebar.AdminApi.TestClient.Classes.OpenAPI;

namespace Spacebar.AdminApi.TestClient.Tests;

public class OpenApiSchemaRefConverterTests {
    [Fact]
    public void DeserializesSchemaValuedAdditionalProperties() {
        const string json = """
            {
              "type": "object",
              "additionalProperties": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
            """;

        var schema = JsonSerializer.Deserialize<OpenApiSchemaRef>(json)!;

        Assert.Equal("object", schema.Type);
        Assert.Null(schema.AdditionalPropertiesAllowed);
        Assert.NotNull(schema.AdditionalProperties);
        Assert.Equal("array", schema.AdditionalProperties!.Type);
        Assert.Equal("string", schema.AdditionalProperties.Items![0].Type);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void DeserializesBooleanAdditionalProperties(bool allowed) {
        var schema = JsonSerializer.Deserialize<OpenApiSchemaRef>($$"""
            {
              "type": "object",
              "additionalProperties": {{allowed.ToString().ToLowerInvariant()}}
            }
            """)!;

        Assert.Equal(allowed, schema.AdditionalPropertiesAllowed);
        Assert.Null(schema.AdditionalProperties);
    }

    [Fact]
    public void SerializesAdditionalPropertiesSchema() {
        var schema = new OpenApiSchemaRef {
            Type = "object",
            AdditionalProperties = new OpenApiSchemaRef {
                Type = "string",
            },
        };

        var json = JsonSerializer.Serialize(schema);
        var node = JsonNode.Parse(json)!;

        Assert.Equal("object", node["type"]!.GetValue<string>());
        Assert.Equal("string", node["additionalProperties"]!["type"]!.GetValue<string>());
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void SerializesBooleanAdditionalProperties(bool allowed) {
        var schema = new OpenApiSchemaRef {
            Type = "object",
            AdditionalPropertiesAllowed = allowed,
        };

        var json = JsonSerializer.Serialize(schema);
        var node = JsonNode.Parse(json)!;

        Assert.Equal("object", node["type"]!.GetValue<string>());
        Assert.Equal(allowed, node["additionalProperties"]!.GetValue<bool>());
    }

    [Fact]
    public void DeserializesReferencedAdditionalPropertiesSchema() {
        const string json = """
            {
              "type": "object",
              "additionalProperties": {
                "$ref": "#/components/schemas/LocalizedString"
              }
            }
            """;

        var schema = JsonSerializer.Deserialize<OpenApiSchemaRef>(json)!;

        Assert.Equal("#/components/schemas/LocalizedString", schema.AdditionalProperties!.Ref);
    }

    [Fact]
    public void RejectsUnsupportedAdditionalPropertiesValue() {
        const string json = """
            {
              "type": "object",
              "additionalProperties": []
            }
            """;

        var ex = Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<OpenApiSchemaRef>(json));

        Assert.Contains("Expected bool|object in additionalProperties", ex.Message);
    }
}
