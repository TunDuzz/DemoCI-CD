using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Cinestream.Domain.Entities;

public class Comment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MovieId { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;
    
    public Guid? ParentId { get; set; }
    public Comment? Parent { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
    
    public bool IsSpoiler { get; set; }
    
    public int LikeCount { get; set; }
    public int DislikeCount { get; set; }
    public int ReplyCount { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<CommentReaction> Reactions { get; set; } = new List<CommentReaction>();
}
