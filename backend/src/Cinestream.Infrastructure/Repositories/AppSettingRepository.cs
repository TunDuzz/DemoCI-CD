using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;
using Cinestream.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Cinestream.Infrastructure.Repositories;

public class AppSettingRepository : IAppSettingRepository
{
    private readonly AppDbContext _context;

    public AppSettingRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AppSetting?> GetByKeyAsync(string key)
    {
        return await _context.Set<AppSetting>().FirstOrDefaultAsync(s => s.Key == key);
    }

    public async Task UpdateAsync(AppSetting setting)
    {
        var existing = await GetByKeyAsync(setting.Key);
        if (existing == null)
        {
            _context.Set<AppSetting>().Add(setting);
        }
        else
        {
            existing.Value = setting.Value;
            existing.UpdatedAt = DateTime.UtcNow;
            _context.Set<AppSetting>().Update(existing);
        }
        await _context.SaveChangesAsync();
    }
}
