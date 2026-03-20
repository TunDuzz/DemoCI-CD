using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class CountryResponseDTO
{
    [JsonPropertyName("status")]
    [JsonConverter(typeof(FlexibleBoolConverter))]
    public bool Status { get; set; }
    
    [JsonPropertyName("msg")]
    public string Msg { get; set; } = string.Empty;
    
    [JsonPropertyName("data")]
    public CountryDataDTO? Data { get; set; }
}

public class CountryDataDTO
{
    [JsonPropertyName("items")]
    public List<CountryDTO> Items { get; set; } = new List<CountryDTO>();
}
