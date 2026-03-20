using System.Security.Claims;
using Cinestream.Application.DTOs.Auth;
using Cinestream.Application.Interfaces.Services;
using Cinestream.Application.Interfaces.Common;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;

namespace Cinestream.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (!string.IsNullOrEmpty(request.IpAddress) && request.IpAddress != "Unknown")
        {
            var count = await _userRepository.CountUsersByIpAsync(request.IpAddress);
            if (count >= 5)
            {
                throw new Exception("Thiết bị của bạn đã đạt giới hạn tạo tài khoản tối đa (5 tài khoản).");
            }
        }

        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new Exception("Email already exists");
        }

        var user = new User
        {
            Email = request.Email,
            DisplayName = request.DisplayName,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            CreatedIpAddress = request.IpAddress,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var token = _jwtTokenGenerator.GenerateToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();
        
        user.RefreshTokenHash = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        
        await _userRepository.AddAsync(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Email = user.Email,
            Id = user.Id
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new Exception("Invalid email or password");
        }

        bool isPasswordValid = _passwordHasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new Exception("Invalid email or password");
        }

        var token = _jwtTokenGenerator.GenerateToken(user);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshTokenHash = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        
        await _userRepository.UpdateAsync(user);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = refreshToken,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Email = user.Email,
            Id = user.Id
        };
    }

    public async Task<AuthResponse> RefreshTokenAsync(RefreshRequest request)
    {
        var principal = _jwtTokenGenerator.GetPrincipalFromExpiredToken(request.Token);
        if (principal == null)
            throw new Exception("Invalid token");

        var email = principal.FindFirstValue(ClaimTypes.Email);
        var user = await _userRepository.GetByEmailAsync(email!);
        if (user == null || user.RefreshTokenHash != request.RefreshToken || user.RefreshTokenExpiry <= DateTime.UtcNow)
        {
            throw new Exception("Invalid refresh token");
        }

        var newJwtToken = _jwtTokenGenerator.GenerateToken(user);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        user.RefreshTokenHash = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        
        await _userRepository.UpdateAsync(user);

        return new AuthResponse
        {
            Token = newJwtToken,
            RefreshToken = newRefreshToken,
            DisplayName = user.DisplayName,
            AvatarUrl = user.AvatarUrl,
            Email = user.Email,
            Id = user.Id
        };
    }
}
