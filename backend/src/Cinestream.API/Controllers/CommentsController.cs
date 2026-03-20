using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Cinestream.Application.DTOs.Comment;
using Cinestream.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;

namespace Cinestream.API.Controllers;

[ApiController]
[Route("api/movies/{movieId}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetComments(
        string movieId,
        [FromQuery] string sortBy = "newest",
        [FromQuery] Guid? cursorId = null,
        [FromQuery] int pageSize = 20)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? userId = string.IsNullOrEmpty(userIdString) ? null : Guid.Parse(userIdString);

        var comments = await _commentService.GetCommentsAsync(movieId, userId, sortBy, cursorId, pageSize);
        return Ok(new { success = true, data = comments });
    }

    [HttpGet("{parentId}/replies")]
    public async Task<IActionResult> GetReplies(
        string movieId,
        Guid parentId,
        [FromQuery] Guid? cursorId = null,
        [FromQuery] int pageSize = 20)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? userId = string.IsNullOrEmpty(userIdString) ? null : Guid.Parse(userIdString);

        var replies = await _commentService.GetRepliesAsync(parentId, userId, cursorId, pageSize);
        return Ok(new { success = true, data = replies });
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("StrictPolicy")]
    public async Task<IActionResult> CreateComment(string movieId, [FromBody] CreateCommentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var comment = await _commentService.CreateCommentAsync(movieId, userId, request);
        return CreatedAtAction(nameof(GetComments), new { movieId }, new { success = true, data = comment });
    }

    [HttpPut("/api/comments/{id}")]
    [Authorize]
    [EnableRateLimiting("StrictPolicy")]
    public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        try
        {
            var comment = await _commentService.UpdateCommentAsync(id, userId, request);
            return Ok(new { success = true, data = comment });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpDelete("/api/comments/{id}")]
    [Authorize]
    [EnableRateLimiting("StrictPolicy")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        
        var userId = Guid.Parse(userIdString);
        
        try 
        {
            var success = await _commentService.DeleteCommentAsync(id, userId);
            if (!success) return NotFound(new { success = false, message = "Comment not found or already deleted" });
            return Ok(new { success = true });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("/api/comments/{id}/react")]
    [Authorize]
    [EnableRateLimiting("StrictPolicy")]
    public async Task<IActionResult> ReactToComment(Guid id, [FromBody] CommentReactionRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        try
        {
            await _commentService.ReactToCommentAsync(id, userId, request.IsLike);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
