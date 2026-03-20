using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Cinestream.Application.DTOs;
using Cinestream.Application.DTOs.MovieApi;
using Cinestream.Application.Interfaces.Services;

namespace Cinestream.Infrastructure.ExternalServices;

public class MovieService : IMovieService
{
    private readonly HttpClient _httpClient;
    private readonly MovieApiSettings _settings;
    private readonly ILogger<MovieService> _logger;

    public MovieService(HttpClient httpClient, IOptions<MovieApiSettings> settings, ILogger<MovieService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
    }

    public async Task<MovieListResponse> GetNewMoviesAsync(int page = 1)
    {
        _logger.LogInformation("Fetching new movies, page {Page}", page);
        var response = await _httpClient.GetAsync($"/danh-sach/phim-moi-cap-nhat?page={page}");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<MovieListResponse>(content) ?? new MovieListResponse();
    }

    public async Task<MovieDetailResponse> GetMovieDetailAsync(string slug)
    {
        _logger.LogInformation("Fetching movie detail for slug: {Slug}", slug);
        var response = await _httpClient.GetAsync($"/phim/{slug}");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<MovieDetailResponse>(content) ?? new MovieDetailResponse();
        
        // Ensure episodes are inside the movie object for frontend compatibility
        if (result.Movie != null && result.Episodes != null && result.Episodes.Count > 0)
        {
            result.Movie.Episodes = result.Episodes;
        }
        
        return result;
    }

    public async Task<FilteredMovieListResponse> GetMoviesByTypeAsync(
        string type, int page = 1, string? category = null, string? country = null, int? year = null)
    {
        var queryParams = new List<string> { $"page={page}" };
        if (!string.IsNullOrEmpty(category)) queryParams.Add($"category={category}");
        if (!string.IsNullOrEmpty(country)) queryParams.Add($"country={country}");
        if (year.HasValue) queryParams.Add($"year={year}");

        var queryString = string.Join("&", queryParams);
        var url = $"/v1/api/danh-sach/{type}?{queryString}";

        _logger.LogInformation("Fetching movies by type: {Url}", url);
        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<FilteredMovieListResponse>(content) ?? new FilteredMovieListResponse();
    }

    public async Task<FilteredMovieListResponse> SearchMoviesAsync(string keyword, int page = 1, string? category = null, string? country = null, int? year = null, string? type = null)
    {
        _logger.LogInformation("Searching movies with keyword: {Keyword}, page: {Page}, category: {Category}, country: {Country}, year: {Year}, type: {Type}", keyword, page, category, country, year, type);
        
        // Fetch up to 100 results from Ophim because tim-kiem doesn't support server-side filtering
        var response = await _httpClient.GetAsync($"/v1/api/tim-kiem?keyword={keyword}&limit=120");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<FilteredMovieListResponse>(content) ?? new FilteredMovieListResponse();

        if (result.Data?.Items != null)
        {
            var items = result.Data.Items.AsEnumerable();
            
            if (year.HasValue) items = items.Where(i => i.Year == year.Value);
            if (!string.IsNullOrEmpty(type)) items = items.Where(i => i.Type == type);
            if (!string.IsNullOrEmpty(category)) items = items.Where(i => i.Category != null && i.Category.Any(c => c.Slug == category));
            // Ensure Country filtering mapping safely
            if (!string.IsNullOrEmpty(country)) 
            {
               // Ophim returns country inside MovieItemDto but our DTO might not contain it deeply mapped.
               // We added Country so we check it here:
               items = items.Where(i => i.Country != null && i.Country.Any(c => c.Slug == country));
            }

            var filteredItems = items.ToList();
            int pageSize = 24;
            
            // Adjust pagination
            result.Data.Items = filteredItems.Skip((page - 1) * pageSize).Take(pageSize).ToList();
            if (result.Data.Params == null) result.Data.Params = new ParamsDto { Pagination = new PaginationDto() };
            if (result.Data.Params.Pagination == null) result.Data.Params.Pagination = new PaginationDto();
            
            result.Data.Params.Pagination.TotalItems = filteredItems.Count;
            result.Data.Params.Pagination.TotalItemsPerPage = pageSize;
            result.Data.Params.Pagination.CurrentPage = page;
            result.Data.Params.Pagination.TotalPages = (int)Math.Ceiling((double)filteredItems.Count / pageSize);
        }

        return result;
    }

    public async Task<FilteredMovieListResponse> GetMoviesByCategoryAsync(string slug, int page = 1, string? country = null, int? year = null)
    {
        _logger.LogInformation("Fetching movies by category: {Slug}, page {Page}, country {Country}, year {Year}", slug, page, country, year);
        
        var queryParams = new List<string> { $"page={page}" };
        if (!string.IsNullOrEmpty(country)) queryParams.Add($"country={country}");
        if (year.HasValue) queryParams.Add($"year={year}");
        
        var queryString = string.Join("&", queryParams);
        var url = $"/v1/api/the-loai/{slug}?{queryString}";

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<FilteredMovieListResponse>(content) ?? new FilteredMovieListResponse();
    }

    public async Task<FilteredMovieListResponse> GetMoviesByCountryAsync(string slug, int page = 1, string? category = null, int? year = null)
    {
        _logger.LogInformation("Fetching movies by country: {Slug}, page {Page}, category {Category}, year {Year}", slug, page, category, year);
        
        var queryParams = new List<string> { $"page={page}" };
        if (!string.IsNullOrEmpty(category)) queryParams.Add($"category={category}");
        if (year.HasValue) queryParams.Add($"year={year}");
        
        var queryString = string.Join("&", queryParams);
        var url = $"/v1/api/quoc-gia/{slug}?{queryString}";

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<FilteredMovieListResponse>(content) ?? new FilteredMovieListResponse();
    }

    public async Task<CategoryResponseDTO> GetCategoriesAsync()
    {
        _logger.LogInformation("Fetching categories");
        var response = await _httpClient.GetAsync("/the-loai");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<List<CategoryDTO>>(content) ?? [];
        return new CategoryResponseDTO
        {
            Status = true,
            Msg = "Success",
            Data = new CategoryDataDTO { Items = list }
        };
    }

    public async Task<CountryResponseDTO> GetCountriesAsync()
    {
        _logger.LogInformation("Fetching countries");
        var response = await _httpClient.GetAsync("/quoc-gia");
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var list = JsonSerializer.Deserialize<List<CountryDTO>>(content) ?? [];
        return new CountryResponseDTO
        {
            Status = true,
            Msg = "Success",
            Data = new CountryDataDTO { Items = list }
        };
    }
}
