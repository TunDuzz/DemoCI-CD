using Cinestream.Application.DTOs.WatchHistory;
using Cinestream.Application.Interfaces.Services;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;

namespace Cinestream.Infrastructure.Services;

public class WatchHistoryService : IWatchHistoryService
{
    private readonly IWatchHistoryRepository _watchHistoryRepository;

    public WatchHistoryService(IWatchHistoryRepository watchHistoryRepository)
    {
        _watchHistoryRepository = watchHistoryRepository;
    }

    public async Task SaveProgressAsync(Guid userId, WatchHistoryDto dto)
    {
        var normalizedEpisode = string.IsNullOrWhiteSpace(dto.Episode)
            ? null
            : dto.Episode.Trim().TrimEnd('.');

        var history = await _watchHistoryRepository.GetByUserIdAndEpisodeAsync(userId, dto.MovieSlug, normalizedEpisode);

        if (history == null)
        {
            history = new WatchHistory
            {
                UserId = userId,
                MovieId = dto.MovieId,
                MovieName = dto.MovieName,
                MovieSlug = dto.MovieSlug,
                MovieThumbUrl = dto.MovieThumbUrl,
                Episode = normalizedEpisode,
                WatchedTimeInSeconds = dto.WatchedTimeInSeconds,
                IsCompleted = dto.IsCompleted,
                LastWatchedAt = DateTime.UtcNow
            };
            await _watchHistoryRepository.AddAsync(history);
        }
        else
        {
            history.MovieName = dto.MovieName;
            history.MovieSlug = dto.MovieSlug;
            history.MovieThumbUrl = dto.MovieThumbUrl;
            history.Episode = normalizedEpisode;
            history.WatchedTimeInSeconds = dto.WatchedTimeInSeconds;

            history.IsCompleted = history.IsCompleted || dto.IsCompleted;

            if (dto.WatchedTimeInSeconds > 0)
            {
                history.LastWatchedAt = DateTime.UtcNow;
            }

            await _watchHistoryRepository.UpdateAsync(history);
        }
    }

    public async Task<IEnumerable<WatchHistoryDto>> GetUserHistoryAsync(Guid userId)
    {
        var histories = await _watchHistoryRepository.GetUserHistoryAsync(userId);
        return histories.Select(w => new WatchHistoryDto
        {
            MovieId = w.MovieId,
            MovieName = w.MovieName,
            MovieSlug = w.MovieSlug,
            MovieThumbUrl = w.MovieThumbUrl,
            Episode = w.Episode,
            WatchedTimeInSeconds = w.WatchedTimeInSeconds,
            IsCompleted = w.IsCompleted,
            LastWatchedAt = w.LastWatchedAt
        });
    }

    public async Task<IEnumerable<WatchHistoryDto>> GetMovieHistoryAsync(Guid userId, string movieId)
    {
        var histories = await _watchHistoryRepository.GetByMovieIdAsync(userId, movieId);
        return histories.Select(w => new WatchHistoryDto
        {
            MovieId = w.MovieId,
            MovieName = w.MovieName,
            MovieSlug = w.MovieSlug,
            MovieThumbUrl = w.MovieThumbUrl,
            Episode = w.Episode,
            WatchedTimeInSeconds = w.WatchedTimeInSeconds,
            IsCompleted = w.IsCompleted,
            LastWatchedAt = w.LastWatchedAt
        });
    }
}
