using System;
using System.Threading.Tasks;
using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Repositories;

public interface IRatingRepository
{
    Task<MovieRating?> GetUserRatingAsync(string movieId, Guid userId);
    Task AddAsync(MovieRating rating);
    Task UpdateAsync(MovieRating rating);
    Task<(int TotalCount, double Average)> GetMovieRatingStatsAsync(string movieId);
}
