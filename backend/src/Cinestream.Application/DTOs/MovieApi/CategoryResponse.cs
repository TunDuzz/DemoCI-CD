using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class CategoryResponseDTO
{
    [JsonPropertyName("status")]
    [JsonConverter(typeof(FlexibleBoolConverter))]
    public bool Status { get; set; }
    
    [JsonPropertyName("msg")]
    public string Msg { get; set; } = string.Empty;
    
    [JsonPropertyName("data")]
    public CategoryDataDTO? Data { get; set; }
}

public class CategoryDataDTO
{
    [JsonPropertyName("items")]
    public List<CategoryDTO> Items { get; set; } = new List<CategoryDTO>();
}
