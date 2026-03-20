using System;

namespace Cinestream.Application.DTOs.Comment;

public class UpdateCommentRequest
{
    public string Content { get; set; } = string.Empty;
    public bool IsSpoiler { get; set; }
}
