using System;

namespace Cinestream.Application.DTOs.Rating;

public class MovieRatingDto
{
    public Guid Id { get; set; }
    public string MovieId { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class MovieRatingStatsDto
{
    public string MovieId { get; set; } = string.Empty;
    public int TotalRatings { get; set; }
    public double AverageScore { get; set; }
    public int? CurrentUserScore { get; set; }
}
