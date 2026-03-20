namespace Cinestream.Application.DTOs.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Email { get; set; } = string.Empty;
    public Guid Id { get; set; }
}
