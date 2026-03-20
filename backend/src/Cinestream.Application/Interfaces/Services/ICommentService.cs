using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cinestream.Application.DTOs.Comment;
using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Services;

public interface ICommentService
{
    Task<IEnumerable<CommentDto>> GetCommentsAsync(string movieId, Guid? currentUserId, string sortBy, Guid? cursorId, int pageSize);
    Task<IEnumerable<CommentDto>> GetRepliesAsync(Guid parentId, Guid? currentUserId, Guid? cursorId, int pageSize);
    Task<CommentDto> CreateCommentAsync(string movieId, Guid userId, CreateCommentRequest request);
    Task<CommentDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateCommentRequest request);
    Task<bool> DeleteCommentAsync(Guid commentId, Guid userId);
    Task ReactToCommentAsync(Guid commentId, Guid userId, bool isLike);
}
