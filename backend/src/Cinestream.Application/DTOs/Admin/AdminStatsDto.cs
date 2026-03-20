namespace Cinestream.Application.DTOs.Admin;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalViews { get; set; }
    public int TotalFavorites { get; set; }
    public int ActiveUserCount { get; set; }
    public List<MovieStatDto> TopMovies { get; set; } = new();

    // For real % growth calculation: this week vs previous week
    public int NewUsersThisWeek { get; set; }
    public int NewUsersPrevWeek { get; set; }
    public int ViewsThisWeek { get; set; }
    public int ViewsPrevWeek { get; set; }
    public int FavoritesThisWeek { get; set; }
    public int FavoritesPrevWeek { get; set; }
}

public class MovieStatDto
{
    public string MovieId { get; set; } = string.Empty;
    public string MovieName { get; set; } = string.Empty;
    public string MovieSlug { get; set; } = string.Empty;
    public string MovieThumbUrl { get; set; } = string.Empty;
    public int ViewCount { get; set; }
}
