using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Application.DTOs.Admin;
using Cinestream.Domain.Enums;
using Cinestream.Application.Interfaces.Common;
using System.Security.Claims;

namespace Cinestream.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IWatchHistoryRepository _watchHistoryRepository;
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly IPasswordHasher _passwordHasher;

    public AdminController(
        IUserRepository userRepository,
        IWatchHistoryRepository watchHistoryRepository,
        IFavoriteRepository favoriteRepository,
        IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _watchHistoryRepository = watchHistoryRepository;
        _favoriteRepository = favoriteRepository;
        _passwordHasher = passwordHasher;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var users = await _userRepository.GetAllAsync();
        var watchHistories = await _watchHistoryRepository.GetAllAsync();
        var favorites = await _favoriteRepository.GetAllAsync();

        var now = DateTime.UtcNow;
        var thisWeekStart = now.AddDays(-7);
        var prevWeekStart = now.AddDays(-14);

        var totalUsers = users.Count();
        var totalViews = watchHistories.Count();
        var totalFavorites = favorites.Count();
        var activeUserCount = watchHistories.Select(w => w.UserId).Distinct().Count();

        // Weekly comparison
        var newUsersThisWeek = users.Count(u => u.CreatedAt >= thisWeekStart);
        var newUsersPrevWeek = users.Count(u => u.CreatedAt >= prevWeekStart && u.CreatedAt < thisWeekStart);
        var viewsThisWeek = watchHistories.Count(w => w.LastWatchedAt >= thisWeekStart);
        var viewsPrevWeek = watchHistories.Count(w => w.LastWatchedAt >= prevWeekStart && w.LastWatchedAt < thisWeekStart);
        var favThisWeek = favorites.Count(f => f.AddedAt >= thisWeekStart);
        var favPrevWeek = favorites.Count(f => f.AddedAt >= prevWeekStart && f.AddedAt < thisWeekStart);

        // Calculate top movies (group by MovieId, count view, take top 5)
        var topMovies = watchHistories
            .GroupBy(w => w.MovieId)
            .Select(g => new MovieStatDto
            {
                MovieId = g.Key,
                MovieName = g.FirstOrDefault()?.MovieName ?? g.Key.Replace("-", " ").ToUpper(),
                MovieSlug = g.FirstOrDefault()?.MovieSlug ?? g.Key,
                MovieThumbUrl = g.FirstOrDefault()?.MovieThumbUrl ?? string.Empty,
                ViewCount = g.Count()
            })
            .OrderByDescending(m => m.ViewCount)
            .Take(5)
            .ToList();

        var stats = new AdminStatsDto
        {
            TotalUsers = totalUsers,
            TotalViews = totalViews,
            TotalFavorites = totalFavorites,
            ActiveUserCount = activeUserCount,
            TopMovies = topMovies,
            NewUsersThisWeek = newUsersThisWeek,
            NewUsersPrevWeek = newUsersPrevWeek,
            ViewsThisWeek = viewsThisWeek,
            ViewsPrevWeek = viewsPrevWeek,
            FavoritesThisWeek = favThisWeek,
            FavoritesPrevWeek = favPrevWeek
        };

        return Ok(stats);
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userRepository.GetAllAsync();
        var dtos = users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            Email = u.Email,
            DisplayName = u.DisplayName,
            AvatarUrl = u.AvatarUrl,
            Role = u.Role,
            CreatedAt = u.CreatedAt
        });
        return Ok(dtos);
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        // If changing from Admin to something else, check if there are other admins
        if (user.Role == UserRole.Admin && request.Role != UserRole.Admin)
        {
            var users = await _userRepository.GetAllAsync();
            var adminCount = users.Count(u => u.Role == UserRole.Admin);
            if (adminCount <= 1)
            {
                return BadRequest(new { Message = "Không thể hạ quyền Admin duy nhất trong hệ thống." });
            }
        }

        user.Role = request.Role;
        await _userRepository.UpdateAsync(user);
        return Ok();
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        user.Email = request.Email;
        user.DisplayName = request.DisplayName;
        user.AvatarUrl = request.AvatarUrl;
        
        await _userRepository.UpdateAsync(user);
        return Ok();
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserIdStr)) return Unauthorized();
        var currentUserId = Guid.Parse(currentUserIdStr);

        if (id == currentUserId)
        {
            return BadRequest(new { Message = "Bạn không thể tự xóa chính mình." });
        }

        var userToDelete = await _userRepository.GetByIdAsync(id);
        if (userToDelete == null) return NotFound();

        if (userToDelete.Role == UserRole.Admin)
        {
            var users = await _userRepository.GetAllAsync();
            var adminCount = users.Count(u => u.Role == UserRole.Admin);
            if (adminCount <= 1)
            {
                return BadRequest(new { Message = "Không thể xóa Admin duy nhất trong hệ thống." });
            }
        }

        await _userRepository.DeleteAsync(id);
        return Ok();
    }

    [HttpPut("users/{id}/password")]
    public async Task<IActionResult> ChangePassword(Guid id, [FromBody] AdminChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);
        return Ok();
    }
}
