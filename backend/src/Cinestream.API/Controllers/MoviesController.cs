using Microsoft.AspNetCore.Mvc;
using Cinestream.Application.Interfaces.Services;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.OutputCaching;

namespace Cinestream.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class MoviesController : ControllerBase
{
    private readonly IMovieService _movieService;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public MoviesController(IMovieService movieService, IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _movieService = movieService;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("latest")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetLatestMovies([FromQuery] int page = 1)
    {
        var result = await _movieService.GetNewMoviesAsync(page);
        if (result == null || !result.Status) return StatusCode(500, new { Message = "Error fetching movies" });
        return Ok(result);
    }

    [HttpGet("detail/{slug}")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetMovieDetail(string slug)
    {
        var result = await _movieService.GetMovieDetailAsync(slug);
        if (result == null || !result.Status) return NotFound(new { Message = "Movie not found" });
        return Ok(result);
    }

    [HttpGet("type/{type}")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetMoviesByType(string type, [FromQuery] int page = 1, [FromQuery] string? category = null, [FromQuery] string? country = null, [FromQuery] int? year = null)
    {
        var result = await _movieService.GetMoviesByTypeAsync(type, page, category, country, year);
        if (result == null || !result.Status) return StatusCode(500, new { Message = "Error fetching movies by type" });
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchMovies(
        [FromQuery] string keyword, 
        [FromQuery] int page = 1,
        [FromQuery] string? category = null,
        [FromQuery] string? country = null,
        [FromQuery] int? year = null,
        [FromQuery] string? type = null)
    {
        var result = await _movieService.SearchMoviesAsync(keyword, page, category, country, year, type);
        if (result == null || !result.Status) return StatusCode(500, new { Message = "Error searching movies" });
        return Ok(result);
    }

    [HttpGet("category/{slug}")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetMoviesByCategory(string slug, [FromQuery] int page = 1, [FromQuery] string? country = null, [FromQuery] int? year = null)
    {
        var result = await _movieService.GetMoviesByCategoryAsync(slug, page, country, year);
        if (result == null || !result.Status) return StatusCode(500, new { Message = "Error fetching movies by category" });
        return Ok(result);
    }

    [HttpGet("country/{slug}")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetMoviesByCountry(string slug, [FromQuery] int page = 1, [FromQuery] string? category = null, [FromQuery] int? year = null)
    {
        var result = await _movieService.GetMoviesByCountryAsync(slug, page, category, year);
        if (result == null || !result.Status) return StatusCode(500, new { Message = "Error fetching movies by country" });
        return Ok(result);
    }

    [HttpGet("categories")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetCategories()
    {
        var result = await _movieService.GetCategoriesAsync();
        if (result == null || !result.Status) return StatusCode(500, new { Message = "Error fetching categories" });
        return Ok(result);
    }

    [HttpGet("countries")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetCountries()
    {
        var result = await _movieService.GetCountriesAsync();
        if (result == null || !result.Status) return StatusCode(500, new { Message = "Error fetching countries" });
        return Ok(result);
    }

    /// <summary>
    /// Proxy TMDB credits to get real actor profile photos.
    /// Requires TmdbApi:ApiKey to be set in appsettings.
    /// </summary>
    [HttpGet("credits/{tmdbId}")]
    [OutputCache(Duration = 600)]
    public async Task<IActionResult> GetMovieCredits(string tmdbId, [FromQuery] string mediaType = "movie")
    {
        var apiKey = _configuration["TmdbApi:ApiKey"];
        var baseUrl = _configuration["TmdbApi:BaseUrl"] ?? "https://api.themoviedb.org/3";

        if (string.IsNullOrWhiteSpace(apiKey))
            return Ok(new { cast = Array.Empty<object>() }); // Return empty if no key configured

        var mt = mediaType.ToLower() == "tv" ? "tv" : "movie";
        // Use api_key query parameter instead of Bearer token for better compatibility
        var url = $"{baseUrl}/{mt}/{tmdbId}/credits?api_key={apiKey}&language=vi-VN";

        var httpClient = _httpClientFactory.CreateClient();
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        httpClient.DefaultRequestHeaders.Add("User-Agent", "Cinestream-App");

        try
        {
            var response = await httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return Ok(new { cast = Array.Empty<object>() });

            var json = await response.Content.ReadAsStringAsync();
            return Content(json, "application/json");
        }
        catch
        {
            return Ok(new { cast = Array.Empty<object>() });
        }
    }
}
