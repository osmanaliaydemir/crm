using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class SystemSettingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SystemSettingsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var settings = await _context.SystemSettings
            .AsNoTracking()
            .ToListAsync();
        return Ok(settings);
    }

    [HttpPost("save-batch")]
    public async Task<IActionResult> SaveBatch([FromBody] List<SystemSettingDto> settingsDto)
    {
        foreach (var dto in settingsDto)
        {
            var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == dto.Key);
            if (setting != null)
            {
                setting.Value = dto.Value;
                setting.Category = dto.Category;
                setting.Description = dto.Description;
            }
            else
            {
                _context.SystemSettings.Add(new SystemSetting
                {
                    Id = Guid.NewGuid(),
                    Key = dto.Key,
                    Value = dto.Value,
                    Category = dto.Category,
                    Description = dto.Description,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "SystemAdmin"
                });
            }
        }

        await _context.SaveChangesAsync(default);
        return Ok(new { message = "Ayarlar başarıyla kaydedildi." });
    }
}

public class SystemSettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public string Description { get; set; } = string.Empty;
}
