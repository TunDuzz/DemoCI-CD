using Cinestream.Domain.Enums;

namespace Cinestream.Application.DTOs.Admin;

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateUserRoleRequest
{
    public UserRole Role { get; set; }
}

public class UpdateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
}

public class AdminChangePasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
}
