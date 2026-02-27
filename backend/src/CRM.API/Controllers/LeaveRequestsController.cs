using CRM.Application.HR.DTOs;
using CRM.Application.HR.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveRequestsController : ControllerBase
{
    private readonly ILeaveRequestService _leaveRequestService;
    private readonly IValidator<CreateLeaveRequestDto> _createValidator;
    private readonly IValidator<UpdateLeaveRequestStatusDto> _updateStatusValidator;

    public LeaveRequestsController(
        ILeaveRequestService leaveRequestService,
        IValidator<CreateLeaveRequestDto> createValidator,
        IValidator<UpdateLeaveRequestStatusDto> updateStatusValidator)
    {
        _leaveRequestService = leaveRequestService;
        _createValidator = createValidator;
        _updateStatusValidator = updateStatusValidator;
    }

    [HttpGet]
    [Authorize(Roles = "admin,hr")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _leaveRequestService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _leaveRequestService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeaveRequestDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        // Security check - users can only create requests for themselves unless Admin/HR
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!User.IsInRole("admin") && !User.IsInRole("hr") && dto.UserId.ToString() != userIdString)
        {
            return Forbid();
        }

        var result = await _leaveRequestService.CreateAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "admin,hr")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateLeaveRequestStatusDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _updateStatusValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _leaveRequestService.UpdateStatusAsync(dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }
}
