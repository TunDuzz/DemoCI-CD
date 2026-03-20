using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class FlexibleBoolConverter : JsonConverter<bool>
{
    public override bool Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.True) return true;
        if (reader.TokenType == JsonTokenType.False) return false;

        if (reader.TokenType == JsonTokenType.String)
        {
            var str = reader.GetString()?.ToLowerInvariant();
            if (string.IsNullOrEmpty(str)) return false;

            if (str == "true" || str == "success" || str == "ok" || str == "1") return true;
            if (str == "false" || str == "error" || str == "fail" || str == "0") return false;
        }

        if (reader.TokenType == JsonTokenType.Number)
        {
            return reader.TryGetInt32(out int value) && value > 0;
        }

        return false;
    }

    public override void Write(Utf8JsonWriter writer, bool value, JsonSerializerOptions options)
    {
        writer.WriteBooleanValue(value);
    }
}
