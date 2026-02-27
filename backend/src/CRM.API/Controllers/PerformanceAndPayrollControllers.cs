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
public class PerformanceEvaluationsController : ControllerBase
{
    private readonly IPerformanceService _performanceService;
    private readonly IValidator<CreatePerformanceEvaluationDto> _createValidator;

    public PerformanceEvaluationsController(IPerformanceService performanceService, IValidator<CreatePerformanceEvaluationDto> createValidator)
    {
        _performanceService = performanceService;
        _createValidator = createValidator;
    }

    [HttpGet]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _performanceService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("my-evaluations")]
    public async Task<IActionResult> GetMyEvaluations(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _performanceService.GetByEmployeeIdAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> Create([FromBody] CreatePerformanceEvaluationDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _performanceService.CreateAsync(dto, cancellationToken);
        return Ok(result);
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EmployeeAccess")]
public class PayrollsController : ControllerBase
{
    private readonly IPayrollService _payrollService;
    private readonly IValidator<CreatePayrollDto> _createValidator;

    public PayrollsController(IPayrollService payrollService, IValidator<CreatePayrollDto> createValidator)
    {
        _payrollService = payrollService;
        _createValidator = createValidator;
    }

    [HttpGet]
    [Authorize(Policy = "FinanceAccess")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _payrollService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("my-payrolls")]
    public async Task<IActionResult> GetMyPayrolls(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        var result = await _payrollService.GetByEmployeeIdAsync(userId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "HRAccess")]
    public async Task<IActionResult> Create([FromBody] CreatePayrollDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _payrollService.CreateAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "FinanceAccess")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdatePayrollStatusDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşulmuyor");

        var result = await _payrollService.UpdateStatusAsync(dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }
}
