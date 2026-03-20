using System;
using System.Linq;
using System.Threading.Tasks;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;
using Cinestream.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Cinestream.Infrastructure.Repositories;

public class RatingRepository : IRatingRepository
{
    private readonly AppDbContext _context;

    public RatingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MovieRating?> GetUserRatingAsync(string movieId, Guid userId)
    {
        return await _context.MovieRatings
            .FirstOrDefaultAsync(r => r.MovieId == movieId && r.UserId == userId);
    }

    public async Task AddAsync(MovieRating rating)
    {
        await _context.MovieRatings.AddAsync(rating);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(MovieRating rating)
    {
        rating.UpdatedAt = DateTime.UtcNow;
        _context.MovieRatings.Update(rating);
        await _context.SaveChangesAsync();
    }

    public async Task<(int TotalCount, double Average)> GetMovieRatingStatsAsync(string movieId)
    {
        var ratings = await _context.MovieRatings
            .Where(r => r.MovieId == movieId)
            .Select(r => r.Score)
            .ToListAsync();

        if (!ratings.Any())
            return (0, 0);

        return (ratings.Count, ratings.Average());
    }
}
