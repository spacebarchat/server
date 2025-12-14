using System.Collections.Frozen;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Spacebar.AdminApi.TestClient.Classes.OpenAPI;

public class OpenApiSchema {
    [JsonPropertyName("openapi")]
    public string Version { get; set; } = null!;

    [JsonPropertyName("info")]
    public OpenApiInfo Info { get; set; } = null!;

    [JsonPropertyName("externalDocs")]
    public OpenApiExternalDocs? ExternalDocs { get; set; }

    [JsonPropertyName("paths")]
    public Dictionary<string, OpenApiPath> Paths { get; set; } = null!;

    [JsonPropertyName("servers")]
    public List<OpenApiServer> Servers { get; set; } = null!;

    [JsonPropertyName("components")]
    public OpenApiComponents? Components { get; set; } = null!;

    public class OpenApiComponents {
        [JsonPropertyName("schemas")]
        public Dictionary<string, OpenApiSchemaRef>? Schemas { get; set; } = null!;
    }
}

public class OpenApiServer {
    [JsonPropertyName("url")]
    public string Url { get; set; } = null!;

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

public class OpenApiPath {
    public FrozenSet<string> GetAvailableMethods() {
        List<string> methods = new();
        if (Get != null) methods.Add("GET");
        if (Post != null) methods.Add("POST");
        if (Put != null) methods.Add("PUT");
        if (Delete != null) methods.Add("DELETE");
        if (Patch != null) methods.Add("PATCH");
        if (Options != null) methods.Add("OPTIONS");
        return methods.ToFrozenSet();
    }

    public bool HasMethod(string method) {
        return method.ToLower() switch {
            "get" => Get != null,
            "post" => Post != null,
            "put" => Put != null,
            "delete" => Delete != null,
            "patch" => Patch != null,
            "options" => Options != null,
            _ => false
        };
    }

    public OpenApiOperation? GetOperation(string method) {
        if (!HasMethod(method)) return null;
        return method.ToLower() switch {
            "get" => Get,
            "post" => Post,
            "put" => Put,
            "delete" => Delete,
            "patch" => Patch,
            "options" => Options,
            _ => null
        };
    }

    [JsonPropertyName("get")]
    public OpenApiOperation? Get { get; set; }

    [JsonPropertyName("post")]
    public OpenApiOperation? Post { get; set; }

    [JsonPropertyName("put")]
    public OpenApiOperation? Put { get; set; }

    [JsonPropertyName("delete")]
    public OpenApiOperation? Delete { get; set; }

    [JsonPropertyName("patch")]
    public OpenApiOperation? Patch { get; set; }

    [JsonPropertyName("options")]
    public OpenApiOperation? Options { get; set; }

    public class OpenApiOperation {
        [JsonPropertyName("description")]
        public string Description { get; set; } = null!;

        [JsonPropertyName("parameters")]
        public List<OpenApiParameter>? Parameters { get; set; }

        [JsonPropertyName("requestBody")]
        public OpenApiRequestBody? RequestBody { get; set; }

        public class OpenApiParameter {
            [JsonPropertyName("name")]
            public string Name { get; set; } = null!;

            [JsonPropertyName("in")]
            public string In { get; set; } = null!;

            [JsonPropertyName("required")]
            public bool Required { get; set; }

            [JsonPropertyName("schema")]
            public OpenApiSchemaRef Schema { get; set; } = null!;

            [JsonPropertyName("description")]
            public string? Description { get; set; }
        }
    }
}

public class OpenApiExternalDocs {
    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;

    [JsonPropertyName("url")]
    public string Url { get; set; } = null!;
}

public class OpenApiInfo {
    [JsonPropertyName("title")]
    public string Title { get; set; } = null!;

    [JsonPropertyName("version")]
    public string Version { get; set; } = null!;

    [JsonPropertyName("description")]
    public string Description { get; set; } = null!;

    [JsonPropertyName("license")]
    public OpenApiLicense License { get; set; } = null!;

    public class OpenApiLicense {
        [JsonPropertyName("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("url")]
        public string Url { get; set; } = null!;
    }
}

public class OpenApiRequestBody {
    [JsonPropertyName("content")]
    public OpenApiContent Content { get; set; } = null!;

    [JsonPropertyName("required")]
    public bool Required { get; set; }
}

public class OpenApiContent {
    [JsonPropertyName("application/json")]
    public OpenApiSchemaContainer? ApplicationJson { get; set; }

    public class OpenApiSchemaContainer {
        [JsonPropertyName("schema")]
        public OpenApiSchemaRef Schema { get; set; } = null!;
    }
}

[JsonConverter(typeof(OpenApiSchemaRefConverter))]
public class OpenApiSchemaRef {
    public string? Description { get; set; }
    public string? Type { get; set; } = null!;
    public List<string>? Types { get; set; } = null!;
    public string? Ref { get; set; } = null!;
    public Dictionary<string, OpenApiSchemaRef>? Properties { get; set; }
    public List<string>? Required { get; set; }
    public int? MinLength { get; set; }
    public int? MaxLength { get; set; }
    public int? MinItems { get; set; }
    public int? MaxItems { get; set; }
    public object? Constant { get; set; }
    public object? Default { get; set; }
    public bool Nullable { get; set; }
    public List<OpenApiSchemaRef>? AnyOf { get; set; }
    public List<object>? Enum { get; set; }
    public string? Format { get; set; }

    public OpenApiSchemaRef? GetReferencedSchema(OpenApiSchema schema) {
        if (Ref == null) return null;
        string refKey = Ref.Replace("#/components/schemas/", "");
        if (schema.Components?.Schemas != null && schema.Components.Schemas.TryGetValue(refKey, out var referencedSchema)) {
            return referencedSchema;
        }

        throw new KeyNotFoundException($"Referenced schema '{refKey}' not found.");
    }
}

public class OpenApiSchemaRefConverter : JsonConverter<OpenApiSchemaRef> {
    public override OpenApiSchemaRef? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) {
        if (reader.TokenType != JsonTokenType.StartObject) {
            throw new JsonException("Expected StartObject token");
        }

        using var jsonDoc = JsonDocument.ParseValue(ref reader);
        var jsonObject = jsonDoc.RootElement;
        var schemaRef = new OpenApiSchemaRef();

        foreach (var property in jsonObject.EnumerateObject()) {
            switch (property.Name) {
                case "type":
                    if (property.Value.ValueKind == JsonValueKind.String) {
                        schemaRef.Type = property.Value.GetString();
                    }
                    else if (property.Value.ValueKind == JsonValueKind.Array) {
                        var types = new List<string>();
                        foreach (var item in property.Value.EnumerateArray()) {
                            if (item.ValueKind == JsonValueKind.String) {
                                types.Add(item.GetString()!);
                            }
                            else throw new JsonException("Expected string in type array");
                        }

                        schemaRef.Types = types;
                    }

                    break;
                case "$ref":
                    schemaRef.Ref = property.Value.GetString();
                    break;
                case "description":
                    schemaRef.Description = property.Value.GetString();
                    break;
                case "properties":
                    schemaRef.Properties = property.Value.EnumerateObject().ToDictionary(x => x.Name, x => x.Value.Deserialize<OpenApiSchemaRef>(options)!);
                    break;
                case "required":
                    schemaRef.Required = property.Value.EnumerateArray().Select(item => item.GetString()!).ToList();
                    break;
                case "minLength":
                    schemaRef.MinLength = property.Value.GetInt32();
                    break;
                case "maxLength":
                    schemaRef.MaxLength = property.Value.GetInt32();
                    break;
                case "minItems":
                    schemaRef.MinItems = property.Value.GetInt32();
                    break;
                case "maxItems":
                    schemaRef.MaxItems = property.Value.GetInt32();
                    break;
                case "const":
                    if (property.Value.ValueKind == JsonValueKind.String)
                        schemaRef.Constant = property.Value.GetString();
                    else if (property.Value.ValueKind == JsonValueKind.Number)
                        schemaRef.Constant = property.Value.GetInt32();
                    else if (property.Value.ValueKind is JsonValueKind.True or JsonValueKind.False)
                        schemaRef.Constant = property.Value.GetBoolean();
                    else throw new JsonException($"Expected string|int|bool in const, got {property.Value.ValueKind}");
                    break;
                case "default":
                    if (property.Value.ValueKind == JsonValueKind.String)
                        schemaRef.Default = property.Value.GetString();
                    else if (property.Value.ValueKind == JsonValueKind.Number)
                        schemaRef.Default = property.Value.GetInt32();
                    else if (property.Value.ValueKind is JsonValueKind.True or JsonValueKind.False)
                        schemaRef.Default = property.Value.GetBoolean();
                    else if (property.Value.ValueKind == JsonValueKind.Null)
                        schemaRef.Default = null;
                    else if (property.Value.ValueKind == JsonValueKind.Array)
                        if (property.Value.GetArrayLength() > 0) throw new JsonException("Expected empty array in default");
                        else schemaRef.Default = Array.Empty<object>();
                    else throw new JsonException($"Expected string|int|bool|null in default, got {property.Value.ValueKind}");
                    break;
                case "enum":
                    var enumValues = new List<object>();
                    foreach (var item in property.Value.EnumerateArray()) {
                        if (item.ValueKind == JsonValueKind.String)
                            enumValues.Add(item.GetString()!);
                        else if (item.ValueKind == JsonValueKind.Number)
                            enumValues.Add(item.GetInt32());
                        else if (item.ValueKind is JsonValueKind.True or JsonValueKind.False)
                            enumValues.Add(item.GetBoolean());
                        else if (item.ValueKind == JsonValueKind.Null)
                            enumValues.Add(null!);
                        else throw new JsonException($"Expected string|int|bool|null in enum, got {item.ValueKind}");
                    }

                    schemaRef.Enum = enumValues;
                    break;
                case "nullable":
                    schemaRef.Nullable = property.Value.GetBoolean();
                    break;
                case "anyOf":
                    schemaRef.AnyOf = property.Value.EnumerateArray().Select(item => item.Deserialize<OpenApiSchemaRef>(options)!).ToList();
                    break;
                case "format":
                    schemaRef.Format = property.Value.GetString();
                    break;
                case "additionalProperties": //TODO
                case "patternProperties": // Side effect of using JsonValue in typescript
                    break;
                default:
                    Console.WriteLine($"Got unexpected prop {property.Name} in OpenApiSchemaRef!");
                    break;
            }
        }

        return schemaRef;
    }

    public override void Write(Utf8JsonWriter writer, OpenApiSchemaRef value, JsonSerializerOptions options) {
        // throw new NotImplementedException("Serialization not implemented for OpenApiSchemaRef");
        writer.WriteStartObject();
        if (value.Type != null) {
            writer.WriteString("type", value.Type);
        }
        else if (value.Types != null) {
            writer.WritePropertyName("type");
            writer.WriteStartArray();
            foreach (var type in value.Types) {
                writer.WriteStringValue(type);
            }

            writer.WriteEndArray();
        }

        if (value.Ref != null) {
            writer.WriteString("$ref", value.Ref);
        }

        if (value.Description != null) {
            writer.WriteString("description", value.Description);
        }

        if (value.Properties != null) {
            writer.WritePropertyName("properties");
            writer.WriteStartObject();
            foreach (var prop in value.Properties) {
                writer.WritePropertyName(prop.Key);
                JsonSerializer.Serialize(writer, prop.Value, options);
            }

            writer.WriteEndObject();
        }

        writer.WriteEndObject();
    }
}