using System.Text.Json.Serialization;

namespace Cinestream.Application.DTOs.MovieApi;

public class PaginationDto
{
    [JsonPropertyName("totalItems")]
    public int TotalItems { get; set; }

    [JsonPropertyName("totalItemsPerPage")]
    public int TotalItemsPerPage { get; set; }

    [JsonPropertyName("currentPage")]
    public int CurrentPage { get; set; }

    private int _totalPages;

    [JsonPropertyName("totalPages")]
    public int TotalPages 
    { 
        get 
        {
            if (_totalPages > 0) return _totalPages;
            if (TotalItems > 0 && TotalItemsPerPage > 0)
            {
                return (int)Math.Ceiling((double)TotalItems / TotalItemsPerPage);
            }
            return 1;
        }
        set { _totalPages = value; }
    }
}
