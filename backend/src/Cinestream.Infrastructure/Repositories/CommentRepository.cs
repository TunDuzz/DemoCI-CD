using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;
using Cinestream.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Cinestream.Infrastructure.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly AppDbContext _context;

    public CommentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Comment?> GetByIdAsync(Guid id)
    {
        return await _context.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Comment>> GetByMovieIdAsync(string movieId, int limit, Guid? cursorId, string sortBy)
    {
        var query = _context.Comments
            .Include(c => c.User)
            .Include(c => c.Reactions) // Include reactions for current user mapping in service
            .Where(c => c.MovieId == movieId && c.ParentId == null);

        // Simple cursor logic based on CreatedAt for newest, or LikeCount for popular
        if (cursorId.HasValue)
        {
            var cursorComment = await _context.Comments.FindAsync(cursorId.Value);
            if (cursorComment != null)
            {
                if (sortBy == "popular")
                {
                    query = query.Where(c => c.LikeCount < cursorComment.LikeCount || 
                                            (c.LikeCount == cursorComment.LikeCount && c.CreatedAt < cursorComment.CreatedAt));
                }
                else
                {
                    query = query.Where(c => c.CreatedAt < cursorComment.CreatedAt);
                }
            }
        }

        if (sortBy == "popular")
        {
            query = query.OrderByDescending(c => c.LikeCount)
                         .ThenByDescending(c => c.CreatedAt);
        }
        else
        {
            query = query.OrderByDescending(c => c.CreatedAt);
        }

        return await query.Take(limit).ToListAsync();
    }

    public async Task<IEnumerable<Comment>> GetRepliesAsync(Guid parentId, int limit, Guid? cursorId)
    {
        var query = _context.Comments
            .Include(c => c.User)
            .Include(c => c.Reactions)
            .Where(c => c.ParentId == parentId);

        if (cursorId.HasValue)
        {
            var cursorComment = await _context.Comments.FindAsync(cursorId.Value);
            if (cursorComment != null)
            {
                // Replies usually sorted by newest
                query = query.Where(c => c.CreatedAt < cursorComment.CreatedAt);
            }
        }

        return await query.OrderByDescending(c => c.CreatedAt).Take(limit).ToListAsync();
    }

    public async Task AddAsync(Comment comment)
    {
        await _context.Comments.AddAsync(comment);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Comment comment)
    {
        comment.UpdatedAt = DateTime.UtcNow;
        _context.Comments.Update(comment);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Comment comment)
    {
        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
    }

    public async Task<CommentReaction?> GetReactionAsync(Guid commentId, Guid userId)
    {
        return await _context.CommentReactions
            .FirstOrDefaultAsync(r => r.CommentId == commentId && r.UserId == userId);
    }

    public async Task AddReactionAsync(CommentReaction reaction)
    {
        await _context.CommentReactions.AddAsync(reaction);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateReactionAsync(CommentReaction reaction)
    {
        _context.CommentReactions.Update(reaction);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteReactionAsync(CommentReaction reaction)
    {
        _context.CommentReactions.Remove(reaction);
        await _context.SaveChangesAsync();
    }
}
