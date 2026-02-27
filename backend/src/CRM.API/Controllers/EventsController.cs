using CRM.Application.Calendar.DTOs;
using CRM.Application.Calendar.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EmployeeAccess")]
public class EventsController : ControllerBase
{
    private readonly IEventService _eventService;
    private readonly IValidator<CreateEventDto> _createValidator;
    private readonly IValidator<UpdateEventDto> _updateValidator;
    private readonly IValidator<AddAttendeeDto> _addAttendeeValidator;
    private readonly IValidator<UpdateAttendeeStatusDto> _updateAttendeeStatusValidator;

    public EventsController(
        IEventService eventService,
        IValidator<CreateEventDto> createValidator,
        IValidator<UpdateEventDto> updateValidator,
        IValidator<AddAttendeeDto> addAttendeeValidator,
        IValidator<UpdateAttendeeStatusDto> updateAttendeeStatusValidator)
    {
        _eventService = eventService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _addAttendeeValidator = addAttendeeValidator;
        _updateAttendeeStatusValidator = updateAttendeeStatusValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateTime? start, 
        [FromQuery] DateTime? end, 
        CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _eventService.GetAllByUserAsync(userId, start, end, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _eventService.GetByIdAsync(id, cancellationToken);
        if (result == null) return NotFound();

        // Security check - User can see the event if it's theirs OR they are an attendee
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdString, out Guid userId))
        {
            if (result.UserId != userId && result.Attendees.All(a => a.UserId != userId))
            {
                return Forbid();
            }
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEventDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _eventService.CreateAsync(dto, userId, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _updateValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _eventService.UpdateAsync(dto, userId, cancellationToken);
        if (result == null) return Forbid(); // Either not found or not owner

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _eventService.DeleteAsync(id, userId, cancellationToken);
        if (!result) return Forbid();

        return NoContent();
    }

    [HttpPost("{id}/attendees")]
    public async Task<IActionResult> AddAttendee(Guid id, [FromBody] AddAttendeeDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.EventId) return BadRequest("EventID uyuşulmuyor");

        var validationResult = await _addAttendeeValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid currentUserId)) return Unauthorized();

        var result = await _eventService.AddAttendeeAsync(dto, currentUserId, cancellationToken);
        if (result == null) return BadRequest("Katılımcı eklenemedi (Zaten ekli olabilir veya yetkiniz yok).");

        return Ok(result);
    }

    [HttpPatch("attendees/{attendeeId}/status")]
    public async Task<IActionResult> UpdateAttendeeStatus(Guid attendeeId, [FromBody] UpdateAttendeeStatusDto dto, CancellationToken cancellationToken)
    {
        if (attendeeId != dto.Id) return BadRequest("AttendeeID uyuşulmuyor");

        var validationResult = await _updateAttendeeStatusValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid currentUserId)) return Unauthorized();

        var result = await _eventService.UpdateAttendeeStatusAsync(dto, currentUserId, cancellationToken);
        if (result == null) return Forbid();

        return Ok(result);
    }

    [HttpDelete("attendees/{attendeeId}")]
    public async Task<IActionResult> RemoveAttendee(Guid attendeeId, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid currentUserId)) return Unauthorized();

        var result = await _eventService.RemoveAttendeeAsync(attendeeId, currentUserId, cancellationToken);
        if (!result) return Forbid();

        return NoContent();
    }
}
