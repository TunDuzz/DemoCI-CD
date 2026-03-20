using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task<int> CountUsersByIpAsync(string ipAddress);
    Task DeleteAsync(Guid id);
}
