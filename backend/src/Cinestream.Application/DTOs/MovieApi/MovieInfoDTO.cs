using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class MovieApiSettings
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ImageBaseUrl { get; set; } = string.Empty;
}

public class TmdbDto
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("vote_average")]
    public double VoteAverage { get; set; }

    [JsonPropertyName("vote_count")]
    public int VoteCount { get; set; }
}

public class ImdbDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("vote_average")]
    public double VoteAverage { get; set; }

    [JsonPropertyName("vote_count")]
    public int VoteCount { get; set; }
}
