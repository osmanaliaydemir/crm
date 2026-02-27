using CRM.Application.Helpdesk.DTOs;
using CRM.Application.Helpdesk.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EmployeeAccess")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly IValidator<CreateTicketDto> _createValidator;
    private readonly IValidator<UpdateTicketStatusDto> _updateStatusValidator;
    private readonly IValidator<AssignTicketDto> _assignValidator;
    private readonly IValidator<CreateTicketCommentDto> _commentValidator;

    public TicketsController(
        ITicketService ticketService,
        IValidator<CreateTicketDto> createValidator,
        IValidator<UpdateTicketStatusDto> updateStatusValidator,
        IValidator<AssignTicketDto> assignValidator,
        IValidator<CreateTicketCommentDto> commentValidator)
    {
        _ticketService = ticketService;
        _createValidator = createValidator;
        _updateStatusValidator = updateStatusValidator;
        _assignValidator = assignValidator;
        _commentValidator = commentValidator;
    }

    [HttpGet]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _ticketService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _ticketService.GetByIdAsync(id, cancellationToken);
        if (result == null) return NotFound();

        // Security check - if not admin/support, user should only see tickets where they are the creator or customer
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!User.IsInRole("admin") && !User.IsInRole("hr"))
        {
            if (result.CreatedByUserId.ToString() != userIdString && result.CustomerId.ToString() != userIdString)
            {
                return Forbid();
            }
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTicketDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid? createdByUserId = null;
        if (Guid.TryParse(userIdString, out Guid parsedId))
        {
            createdByUserId = parsedId;
        }

        var result = await _ticketService.CreateAsync(dto, createdByUserId, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _updateStatusValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _ticketService.UpdateStatusAsync(dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/assign")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignTicketDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _assignValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _ticketService.AssignToAsync(dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] CreateTicketCommentDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.TicketId) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _commentValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        // Check if ticket exists and user has access
        var ticket = await _ticketService.GetByIdAsync(id, cancellationToken);
        if (ticket == null) return NotFound();

        if (!User.IsInRole("admin") && !User.IsInRole("support"))
        {
            if (ticket.CreatedByUserId != userId && ticket.CustomerId != userId)
            {
                return Forbid();
            }
        }

        var result = await _ticketService.AddCommentAsync(dto, userId, cancellationToken);
        return Ok(result);
    }
}
