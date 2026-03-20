using Cinestream.Domain.Entities;

namespace Cinestream.Application.Interfaces.Repositories;

public interface IAppSettingRepository
{
    Task<AppSetting?> GetByKeyAsync(string key);
    Task UpdateAsync(AppSetting setting);
}
