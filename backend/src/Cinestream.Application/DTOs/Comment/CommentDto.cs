using System;

namespace Cinestream.Application.DTOs.Comment;

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    
    public string Content { get; set; } = string.Empty;
    public bool IsSpoiler { get; set; }
    public Guid? ParentId { get; set; }
    
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public int ReplyCount { get; set; }
    
    public bool? CurrentUserReaction { get; set; } // true = Like, false = Dislike, null = No reaction
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
