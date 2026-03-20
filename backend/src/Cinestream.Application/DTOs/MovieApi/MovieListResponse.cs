using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class MovieListResponse
{
    [JsonPropertyName("status")]
    [JsonConverter(typeof(FlexibleBoolConverter))]
    public bool Status { get; set; }
    
    [JsonPropertyName("items")]
    public List<MovieItemDto> Items { get; set; } = new List<MovieItemDto>();

    [JsonPropertyName("pagination")]
    public PaginationDto? Pagination { get; set; }
}

public class MovieResponseDto
{
    [JsonPropertyName("status")]
    [JsonConverter(typeof(FlexibleBoolConverter))]
    public bool Status { get; set; }
    
    [JsonPropertyName("items")]
    public List<MovieItemDto> Items { get; set; } = new List<MovieItemDto>();
    
    [JsonPropertyName("pathImage")]
    public string PathImage { get; set; } = string.Empty;
}
