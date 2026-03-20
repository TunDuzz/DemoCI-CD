using System;
using System.Threading.Tasks;
using Cinestream.Application.DTOs.Rating;

namespace Cinestream.Application.Interfaces.Services;

public interface IRatingService
{
    Task<MovieRatingStatsDto> GetMovieRatingAsync(string movieId, Guid? currentUserId);
    Task<MovieRatingDto> CreateOrUpdateRatingAsync(string movieId, Guid userId, CreateUpdateRatingRequest request);
}
