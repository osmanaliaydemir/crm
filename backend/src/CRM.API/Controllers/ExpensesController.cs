using CRM.Application.HR.DTOs;
using CRM.Application.HR.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EmployeeAccess")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;
    private readonly IValidator<CreateExpenseDto> _createValidator;
    private readonly IValidator<UpdateExpenseStatusDto> _updateStatusValidator;

    public ExpensesController(
        IExpenseService expenseService,
        IValidator<CreateExpenseDto> createValidator,
        IValidator<UpdateExpenseStatusDto> updateStatusValidator)
    {
        _expenseService = expenseService;
        _createValidator = createValidator;
        _updateStatusValidator = updateStatusValidator;
    }

    [HttpGet]
    [Authorize(Policy = "FinanceAccess")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _expenseService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("my-expenses")]
    public async Task<IActionResult> GetMyExpenses(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _expenseService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateExpenseDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);
            
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!User.IsInRole("admin") && !User.IsInRole("hr") && dto.UserId.ToString() != userIdString)
        {
            return Forbid();
        }

        var result = await _expenseService.CreateAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "FinanceAccess")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateExpenseStatusDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _updateStatusValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _expenseService.UpdateStatusAsync(dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }
}
