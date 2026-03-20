using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Repositories;

public interface IFavoriteRepository
{
    Task<Favorite?> GetByUserIdAndMovieIdAsync(Guid userId, string movieId);
    Task<IEnumerable<Favorite>> GetUserFavoritesAsync(Guid userId);
    Task AddAsync(Favorite favorite);
    Task RemoveAsync(Favorite favorite);
    Task<IEnumerable<Favorite>> GetAllAsync();
}
