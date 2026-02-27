using System.Security.Claims;
using CRM.Application.Announcements.DTOs;
using CRM.Application.Announcements.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _announcementService;

    public AnnouncementsController(IAnnouncementService announcementService)
    {
        _announcementService = announcementService;
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
    {
        var announcements = await _announcementService.GetActiveAnnouncementsAsync(cancellationToken);
        return Ok(announcements);
    }

    [HttpGet]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var announcements = await _announcementService.GetAllAnnouncementsAsync(cancellationToken);
        return Ok(announcements);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var announcement = await _announcementService.GetByIdAsync(id, cancellationToken);
        if (announcement == null) return NotFound();
        return Ok(announcement);
    }

    [HttpPost]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto dto, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var announcement = await _announcementService.CreateAsync(dto, userId.Value, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = announcement.Id }, announcement);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAnnouncementDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşmazlığı.");

        var result = await _announcementService.UpdateAsync(dto, cancellationToken);
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/toggle")]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> ToggleStatus(Guid id, CancellationToken cancellationToken)
    {
        var result = await _announcementService.ToggleStatusAsync(id, cancellationToken);
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _announcementService.DeleteAsync(id, cancellationToken);
        if (!result) return NotFound();

        return NoContent();
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim)) return null;
        return Guid.Parse(userIdClaim);
    }
}
