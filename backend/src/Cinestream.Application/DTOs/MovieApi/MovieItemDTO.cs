using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class MovieItemDto
{
    [JsonPropertyName("modified")]
    public MovieModifiedDto? Modified { get; set; }
    
    [JsonPropertyName("_id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    
    [JsonPropertyName("slug")]
    public string Slug { get; set; } = string.Empty;
    
    [JsonPropertyName("origin_name")]
    public string OriginName { get; set; } = string.Empty;
    
    [JsonPropertyName("poster_url")]
    public string PosterUrl { get; set; } = string.Empty;
    
    [JsonPropertyName("thumb_url")]
    public string ThumbUrl { get; set; } = string.Empty;
    
    [JsonPropertyName("year")]
    public int Year { get; set; }
    
    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
    
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;
    
    [JsonPropertyName("time")]
    public string Time { get; set; } = string.Empty;
    
    [JsonPropertyName("episode_current")]
    public string EpisodeCurrent { get; set; } = string.Empty;
    
    [JsonPropertyName("episode_total")]
    public string EpisodeTotal { get; set; } = string.Empty;
    
    [JsonPropertyName("quality")]
    public string Quality { get; set; } = string.Empty;
    
    [JsonPropertyName("lang")]
    public string Lang { get; set; } = string.Empty;
    
    [JsonPropertyName("category")]
    public List<CategoryDTO> Category { get; set; } = new List<CategoryDTO>();

    [JsonPropertyName("country")]
    public List<CountryDTO> Country { get; set; } = new List<CountryDTO>();
}

public class MovieModifiedDto
{
    [JsonPropertyName("time")]
    public DateTime Time { get; set; }
}
