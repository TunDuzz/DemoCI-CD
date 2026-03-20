using System;

namespace Cinestream.Domain.Entities;

public class CommentReaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CommentId { get; set; }
    public Comment Comment { get; set; } = null!;
    
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public bool IsLike { get; set; } // true: Like, false: Dislike
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
