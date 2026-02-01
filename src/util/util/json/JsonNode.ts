/// <summary>Defines the various JSON tokens that make up a JSON text.</summary>
export enum JsonTokenType {
    /// <summary>There is no value (as distinct from <see cref="F:System.Text.Json.JsonTokenType.Null" />). This is the default token type if no data has been read by the <see cref="T:System.Text.Json.Utf8JsonReader" />.</summary>
    None,
    /// <summary>The token type is the start of a JSON object.</summary>
    StartObject,
    /// <summary>The token type is the end of a JSON object.</summary>
    EndObject,
    /// <summary>The token type is the start of a JSON array.</summary>
    StartArray,
    /// <summary>The token type is the end of a JSON array.</summary>
    EndArray,
    /// <summary>The token type is a JSON property name.</summary>
    PropertyName,
    /// <summary>The token type is a comment string.</summary>
    Comment,
    /// <summary>The token type is a JSON string.</summary>
    String,
    /// <summary>The token type is a JSON number.</summary>
    Number,
    /// <summary>The token type is the JSON literal true.</summary>
    True,
    /// <summary>The token type is the JSON literal false.</summary>
    False,
    /// <summary>The token type is the JSON literal null.</summary>
    Null,
}

export class JsonNode {
    type: JsonTokenType = JsonTokenType.None;
}
