using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

/// <summary>
/// Custom converter to handle the OPhim API actor field which can be:
///   - Array of strings: ["Actor Name 1", "Actor Name 2"]
///   - Array of objects: [{"name": "Actor Name", "character": "Role", "profile_path": "/img.jpg"}]
/// </summary>
public class ActorListConverter : JsonConverter<List<ActorDto>>
{
    public override List<ActorDto> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var result = new List<ActorDto>();

        if (reader.TokenType != JsonTokenType.StartArray)
            return result;

        while (reader.Read())
        {
            if (reader.TokenType == JsonTokenType.EndArray)
                break;

            if (reader.TokenType == JsonTokenType.String)
            {
                // Simple string format: "Actor Name"
                var name = reader.GetString() ?? string.Empty;
                if (!string.IsNullOrWhiteSpace(name))
                    result.Add(new ActorDto { Name = name });
            }
            else if (reader.TokenType == JsonTokenType.StartObject)
            {
                // Object format: { "name": "...", "character": "...", "profile_path": "..." }
                var actor = new ActorDto();
                while (reader.Read())
                {
                    if (reader.TokenType == JsonTokenType.EndObject) break;
                    if (reader.TokenType != JsonTokenType.PropertyName) continue;

                    var propName = reader.GetString();
                    reader.Read(); // move to value

                    switch (propName)
                    {
                        case "name":
                            actor.Name = reader.GetString() ?? string.Empty;
                            break;
                        case "character":
                            actor.Character = reader.GetString() ?? string.Empty;
                            break;
                        case "profile_path":
                            actor.ProfilePath = reader.TokenType == JsonTokenType.Null
                                ? null
                                : reader.GetString();
                            break;
                        default:
                            reader.Skip();
                            break;
                    }
                }
                if (!string.IsNullOrWhiteSpace(actor.Name))
                    result.Add(actor);
            }
            else
            {
                reader.Skip();
            }
        }

        return result;
    }

    public override void Write(Utf8JsonWriter writer, List<ActorDto> value, JsonSerializerOptions options)
    {
        JsonSerializer.Serialize(writer, value, options);
    }
}
