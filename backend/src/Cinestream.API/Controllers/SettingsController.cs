using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cinestream.Application.Interfaces.Repositories;
using Cinestream.Domain.Entities;
using System.Text.Json;

namespace Cinestream.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IAppSettingRepository _settingRepository;

    public SettingsController(IAppSettingRepository settingRepository)
    {
        _settingRepository = settingRepository;
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetSetting(string key)
    {
        var setting = await _settingRepository.GetByKeyAsync(key);
        if (setting == null) return NotFound();
        
        try 
        {
            var value = JsonSerializer.Deserialize<object>(setting.Value);
            return Ok(value);
        }
        catch 
        {
            return Ok(setting.Value);
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{key}")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] object value)
    {
        var jsonValue = JsonSerializer.Serialize(value);
        var setting = new AppSetting
        {
            Key = key,
            Value = jsonValue,
            UpdatedAt = DateTime.UtcNow
        };
        await _settingRepository.UpdateAsync(setting);
        return Ok();
    }
}
