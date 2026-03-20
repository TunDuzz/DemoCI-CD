using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Repositories;

public interface IWatchHistoryRepository
{
    Task<WatchHistory?> GetByUserIdAndEpisodeAsync(Guid userId, string movieSlug, string? episode);
    Task<IEnumerable<WatchHistory>> GetUserHistoryAsync(Guid userId);
    Task AddAsync(WatchHistory history);
    Task UpdateAsync(WatchHistory history);
    Task<IEnumerable<WatchHistory>> GetByMovieIdAsync(Guid userId, string movieId);
    Task<IEnumerable<WatchHistory>> GetAllAsync();
}
