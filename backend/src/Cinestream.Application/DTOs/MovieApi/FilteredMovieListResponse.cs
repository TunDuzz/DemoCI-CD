using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class FilteredMovieListResponse : MovieListResponse
{
    [JsonPropertyName("data")]
    public FilteredMovieData? Data { get; set; }
}

public class FilteredMovieData
{
    [JsonPropertyName("items")]
    public List<MovieItemDto> Items { get; set; } = new List<MovieItemDto>();
    
    [JsonPropertyName("params")]
    public ParamsDto? Params { get; set; }
}

public class ParamsDto
{
    [JsonPropertyName("pagination")]
    public PaginationDto? Pagination { get; set; }
}
