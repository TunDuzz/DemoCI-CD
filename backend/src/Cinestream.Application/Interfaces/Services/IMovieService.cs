using Cinestream.Application.DTOs;
using Cinestream.Application.DTOs.MovieApi;

namespace Cinestream.Application.Interfaces.Services;

public interface IMovieService
{
    Task<MovieListResponse> GetNewMoviesAsync(int page = 1);
    Task<MovieDetailResponse> GetMovieDetailAsync(string slug);
    Task<FilteredMovieListResponse> GetMoviesByTypeAsync(string type, int page = 1, string? category = null, string? country = null, int? year = null);
    Task<FilteredMovieListResponse> SearchMoviesAsync(string keyword, int page = 1, string? category = null, string? country = null, int? year = null, string? type = null);
    Task<FilteredMovieListResponse> GetMoviesByCategoryAsync(string slug, int page = 1, string? country = null, int? year = null);
    Task<FilteredMovieListResponse> GetMoviesByCountryAsync(string slug, int page = 1, string? category = null, int? year = null);
    Task<CategoryResponseDTO> GetCategoriesAsync();
    Task<CountryResponseDTO> GetCountriesAsync();
}
