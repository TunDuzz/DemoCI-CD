using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;
using Cinestream.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Cinestream.Infrastructure.Repositories;

public class WatchHistoryRepository : IWatchHistoryRepository
{
    private readonly AppDbContext _context;

    public WatchHistoryRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<WatchHistory?> GetByUserIdAndEpisodeAsync(Guid userId, string movieSlug, string? episode)
    {
        return await _context.WatchHistories
            .FirstOrDefaultAsync(w => w.UserId == userId && w.MovieSlug == movieSlug && w.Episode == episode);
    }

    public async Task<IEnumerable<WatchHistory>> GetUserHistoryAsync(Guid userId)
    {
        return await _context.WatchHistories
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.LastWatchedAt)
            .ToListAsync();
    }

    public async Task AddAsync(WatchHistory history)
    {
        await _context.WatchHistories.AddAsync(history);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(WatchHistory history)
    {
        _context.WatchHistories.Update(history);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<WatchHistory>> GetByMovieIdAsync(Guid userId, string movieSlug)
    {
        return await _context.WatchHistories
            .Where(w => w.UserId == userId && w.MovieSlug == movieSlug)
            .OrderByDescending(w => w.LastWatchedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<WatchHistory>> GetAllAsync()
    {
        return await _context.WatchHistories.ToListAsync();
    }
}
