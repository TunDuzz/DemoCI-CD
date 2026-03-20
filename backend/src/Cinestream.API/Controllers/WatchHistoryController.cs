using Microsoft.AspNetCore.Mvc;
using Cinestream.Application.Interfaces.Services;
using Cinestream.Application.DTOs.WatchHistory;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Cinestream.API.Controllers;

[Route("api/watch-history")]
[ApiController]
[Authorize]
public class WatchHistoryController : ControllerBase
{
    private readonly IWatchHistoryService _watchHistoryService;

    public WatchHistoryController(IWatchHistoryService watchHistoryService)
    {
        _watchHistoryService = watchHistoryService;
    }

    [HttpPost]
    public async Task<IActionResult> SaveProgress([FromBody] WatchHistoryDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        await _watchHistoryService.SaveProgressAsync(userId, dto);
        return Ok(new { Message = "Progress saved" });
    }

    [HttpGet]
    public async Task<IActionResult> GetUserHistory()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var history = await _watchHistoryService.GetUserHistoryAsync(userId);
        return Ok(history);
    }

    [HttpGet("{movieId}")]
    public async Task<IActionResult> GetMovieHistory(string movieId)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var userId = Guid.Parse(userIdStr);
        var history = await _watchHistoryService.GetMovieHistoryAsync(userId, movieId);
        return Ok(history);
    }
}
