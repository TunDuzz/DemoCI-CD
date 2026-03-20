using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Repositories;

public interface ICommentRepository
{
    Task<Comment?> GetByIdAsync(Guid id);
    Task<IEnumerable<Comment>> GetByMovieIdAsync(string movieId, int limit, Guid? cursorId, string sortBy);
    Task<IEnumerable<Comment>> GetRepliesAsync(Guid parentId, int limit, Guid? cursorId);
    Task AddAsync(Comment comment);
    Task UpdateAsync(Comment comment);
    Task DeleteAsync(Comment comment);
    Task<CommentReaction?> GetReactionAsync(Guid commentId, Guid userId);
    Task AddReactionAsync(CommentReaction reaction);
    Task UpdateReactionAsync(CommentReaction reaction);
    Task DeleteReactionAsync(CommentReaction reaction);
}
