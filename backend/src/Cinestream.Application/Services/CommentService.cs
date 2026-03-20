using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cinestream.Application.DTOs.Comment;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Application.Interfaces.Services;
using Cinestream.Domain.Entities;

namespace Cinestream.Application.Services;

public class CommentService : ICommentService
{
    private readonly ICommentRepository _commentRepository;

    public CommentService(ICommentRepository commentRepository)
    {
        _commentRepository = commentRepository;
    }

    public async Task<IEnumerable<CommentDto>> GetCommentsAsync(string movieId, Guid? currentUserId, string sortBy, Guid? cursorId, int pageSize)
    {
        var comments = await _commentRepository.GetByMovieIdAsync(movieId, pageSize, cursorId, sortBy);
        return comments.Select(c => MapToDto(c, currentUserId));
    }

    public async Task<IEnumerable<CommentDto>> GetRepliesAsync(Guid parentId, Guid? currentUserId, Guid? cursorId, int pageSize)
    {
        var replies = await _commentRepository.GetRepliesAsync(parentId, pageSize, cursorId);
        return replies.Select(c => MapToDto(c, currentUserId));
    }

    public async Task<CommentDto> CreateCommentAsync(string movieId, Guid userId, CreateCommentRequest request)
    {
        var comment = new Comment
        {
            MovieId = movieId,
            UserId = userId,
            Content = request.Content,
            IsSpoiler = request.IsSpoiler,
            ParentId = request.ParentId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.ParentId.HasValue)
        {
            var parent = await _commentRepository.GetByIdAsync(request.ParentId.Value);
            if (parent != null)
            {
                parent.ReplyCount++;
                await _commentRepository.UpdateAsync(parent);
            }
        }

        await _commentRepository.AddAsync(comment);
        
        // Reload to get User details
        var createdComment = await _commentRepository.GetByIdAsync(comment.Id);
        return MapToDto(createdComment!, userId);
    }

    public async Task<CommentDto> UpdateCommentAsync(Guid commentId, Guid userId, UpdateCommentRequest request)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null || comment.UserId != userId)
            throw new Exception("Comment not found or unauthorized");

        comment.Content = request.Content;
        comment.IsSpoiler = request.IsSpoiler;
        
        await _commentRepository.UpdateAsync(comment);
        
        return MapToDto(comment, userId);
    }

    public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
            return false;

        if (comment.UserId != userId)
            throw new UnauthorizedAccessException("You are not authorized to delete this comment");

        await _commentRepository.DeleteAsync(comment);

        if (comment.ParentId.HasValue)
        {
            var parent = await _commentRepository.GetByIdAsync(comment.ParentId.Value);
            if (parent != null && parent.ReplyCount > 0)
            {
                parent.ReplyCount--;
                await _commentRepository.UpdateAsync(parent);
            }
        }

        return true;
    }

    public async Task ReactToCommentAsync(Guid commentId, Guid userId, bool isLike)
    {
        var comment = await _commentRepository.GetByIdAsync(commentId);
        if (comment == null)
            throw new Exception("Comment not found");

        var existingReaction = await _commentRepository.GetReactionAsync(commentId, userId);

        if (existingReaction != null)
        {
            if (existingReaction.IsLike == isLike)
            {
                // Remove reaction if clicking the same one again (Toggle off)
                await _commentRepository.DeleteReactionAsync(existingReaction);
                if (isLike) comment.LikeCount = Math.Max(0, comment.LikeCount - 1);
                else comment.DislikeCount = Math.Max(0, comment.DislikeCount - 1);
            }
            else
            {
                // Switch reaction
                existingReaction.IsLike = isLike;
                if (isLike)
                {
                    comment.LikeCount++;
                    comment.DislikeCount = Math.Max(0, comment.DislikeCount - 1);
                }
                else
                {
                    comment.LikeCount = Math.Max(0, comment.LikeCount - 1);
                    comment.DislikeCount++;
                }
                await _commentRepository.UpdateReactionAsync(existingReaction);
            }
        }
        else
        {
            // Add new reaction
            var reaction = new CommentReaction
            {
                CommentId = commentId,
                UserId = userId,
                IsLike = isLike,
                CreatedAt = DateTime.UtcNow
            };
            
            await _commentRepository.AddReactionAsync(reaction);
            
            if (isLike) comment.LikeCount++;
            else comment.DislikeCount++;
        }

        await _commentRepository.UpdateAsync(comment);
    }

    private static CommentDto MapToDto(Comment comment, Guid? currentUserId)
    {
        bool? currentUserReaction = null;
        if (currentUserId.HasValue && comment.Reactions != null)
        {
            var reaction = comment.Reactions.FirstOrDefault(r => r.UserId == currentUserId.Value);
            if (reaction != null) currentUserReaction = reaction.IsLike;
        }

        return new CommentDto
        {
            Id = comment.Id,
            UserId = comment.UserId,
            UserName = comment.User?.DisplayName ?? "Unknown User",
            AvatarUrl = comment.User?.AvatarUrl,
            Content = comment.Content,
            IsSpoiler = comment.IsSpoiler,
            ParentId = comment.ParentId,
            LikeCount = comment.LikeCount,
            DislikeCount = comment.DislikeCount,
            ReplyCount = comment.ReplyCount,
            CurrentUserReaction = currentUserReaction,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}
