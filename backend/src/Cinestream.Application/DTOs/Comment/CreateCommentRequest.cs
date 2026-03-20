using System;

namespace Cinestream.Application.DTOs.Comment;

public class CreateCommentRequest
{
    public Guid? ParentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsSpoiler { get; set; }
}
