using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Cinestream.Application.DTOs.Rating;
using Cinestream.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Mvc;

namespace Cinestream.API.Controllers;

[ApiController]
[Route("api/movies/{movieId}/ratings")]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;

    public RatingsController(IRatingService ratingService)
    {
        _ratingService = ratingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMovieRatingStats(string movieId)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? userId = string.IsNullOrEmpty(userIdString) ? null : Guid.Parse(userIdString);

        var stats = await _ratingService.GetMovieRatingAsync(movieId, userId);
        return Ok(new { success = true, data = stats });
    }

    [HttpPost]
    [Authorize]
    [EnableRateLimiting("StrictPolicy")]
    public async Task<IActionResult> CreateOrUpdateRating(string movieId, [FromBody] CreateUpdateRatingRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        var rating = await _ratingService.CreateOrUpdateRatingAsync(movieId, userId, request);
        return Ok(new { success = true, data = rating });
    }
}
