using Cinestream.Domain.Enums;

namespace Cinestream.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    public string? CreatedIpAddress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public UserRole Role { get; set; } = UserRole.User;

    public ICollection<WatchHistory> WatchHistories { get; set; } = new List<WatchHistory>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<CommentReaction> CommentReactions { get; set; } = new List<CommentReaction>();
    public ICollection<MovieRating> MovieRatings { get; set; } = new List<MovieRating>();
}
