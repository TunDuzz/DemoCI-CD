using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;
using Cinestream.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Cinestream.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly AppDbContext _context;

    public FavoriteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Favorite?> GetByUserIdAndMovieIdAsync(Guid userId, string movieId)
    {
        return await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.MovieId == movieId);
    }

    public async Task<IEnumerable<Favorite>> GetUserFavoritesAsync(Guid userId)
    {
        return await _context.Favorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.AddedAt)
            .ToListAsync();
    }

    public async Task AddAsync(Favorite favorite)
    {
        await _context.Favorites.AddAsync(favorite);
        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(Favorite favorite)
    {
        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Favorite>> GetAllAsync()
    {
        return await _context.Favorites.ToListAsync();
    }
}
