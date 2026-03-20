using System;
using System.Threading.Tasks;
using Cinestream.Application.DTOs.Rating;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Application.Interfaces.Services;
using Cinestream.Domain.Entities;

namespace Cinestream.Application.Services;

public class RatingService : IRatingService
{
    private readonly IRatingRepository _ratingRepository;

    public RatingService(IRatingRepository ratingRepository)
    {
        _ratingRepository = ratingRepository;
    }

    public async Task<MovieRatingStatsDto> GetMovieRatingAsync(string movieId, Guid? currentUserId)
    {
        var stats = await _ratingRepository.GetMovieRatingStatsAsync(movieId);
        int? currentUserScore = null;

        if (currentUserId.HasValue)
        {
            var userRating = await _ratingRepository.GetUserRatingAsync(movieId, currentUserId.Value);
            currentUserScore = userRating?.Score;
        }

        return new MovieRatingStatsDto
        {
            MovieId = movieId,
            TotalRatings = stats.TotalCount,
            AverageScore = stats.Average,
            CurrentUserScore = currentUserScore
        };
    }

    public async Task<MovieRatingDto> CreateOrUpdateRatingAsync(string movieId, Guid userId, CreateUpdateRatingRequest request)
    {
        var existingRating = await _ratingRepository.GetUserRatingAsync(movieId, userId);

        if (existingRating != null)
        {
            existingRating.Score = request.Score;
            await _ratingRepository.UpdateAsync(existingRating);
            return MapToDto(existingRating);
        }

        var newRating = new MovieRating
        {
            MovieId = movieId,
            UserId = userId,
            Score = request.Score,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _ratingRepository.AddAsync(newRating);
        return MapToDto(newRating);
    }

    private static MovieRatingDto MapToDto(MovieRating rating)
    {
        return new MovieRatingDto
        {
            Id = rating.Id,
            MovieId = rating.MovieId,
            UserId = rating.UserId,
            Score = rating.Score,
            CreatedAt = rating.CreatedAt
        };
    }
}
