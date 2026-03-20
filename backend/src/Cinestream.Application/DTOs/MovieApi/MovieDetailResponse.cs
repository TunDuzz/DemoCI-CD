using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

/// <summary>
/// Represents a single actor from OPhim API, which can return either a string (name only)  
/// or an object with profile image from TMDB.
/// </summary>
public class ActorDto
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("character")]
    public string Character { get; set; } = string.Empty;

    /// <summary> TMDB profile image path e.g. "/abc123.jpg" </summary>
    [JsonPropertyName("profile_path")]
    public string? ProfilePath { get; set; }
}

public class MovieDetailResponse
{
    [JsonPropertyName("status")]
    [JsonConverter(typeof(FlexibleBoolConverter))]
    public bool Status { get; set; }
    
    [JsonPropertyName("movie")]
    public MovieDetailDto? Movie { get; set; }

    [JsonPropertyName("episodes")]
    public List<MovieEpisodeServerDto> Episodes { get; set; } = new List<MovieEpisodeServerDto>();
}

public class MovieDetailDto : MovieItemDto
{
    [JsonPropertyName("tmdb")]
    public TmdbDto? Tmdb { get; set; }

    [JsonPropertyName("imdb")]
    public ImdbDto? Imdb { get; set; }

    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty;
    
    [JsonPropertyName("trailer_url")]
    public string TrailerUrl { get; set; } = string.Empty;
    
    [JsonPropertyName("view")]
    public int View { get; set; }

    [JsonPropertyName("actor")]
    [JsonConverter(typeof(ActorListConverter))]
    public List<ActorDto> Actor { get; set; } = new List<ActorDto>();

    [JsonPropertyName("director")]
    public List<string> Director { get; set; } = new List<string>();

    [JsonPropertyName("episodes")]
    public List<MovieEpisodeServerDto> Episodes { get; set; } = new List<MovieEpisodeServerDto>();
}
