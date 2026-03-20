using System;

namespace Cinestream.Domain.Entities;

public class WatchHistory
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string MovieId { get; set; } = string.Empty;
    public string MovieName { get; set; } = string.Empty;
    public string MovieSlug { get; set; } = string.Empty;
    public string MovieThumbUrl { get; set; } = string.Empty;
    public string? Episode { get; set; }
    public int WatchedTimeInSeconds { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime LastWatchedAt { get; set; } = DateTime.UtcNow;
}
