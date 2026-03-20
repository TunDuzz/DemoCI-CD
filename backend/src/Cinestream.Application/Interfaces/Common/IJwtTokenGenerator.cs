using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Common;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
    System.Security.Claims.ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
