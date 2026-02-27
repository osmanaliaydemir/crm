using CRM.Application.Customers.DTOs;
using CRM.Application.Customers.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SalesAccess")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly IValidator<CreateCustomerDto> _createValidator;
    private readonly IValidator<UpdateCustomerDto> _updateValidator;
    private readonly IValidator<CreateInteractionDto> _createInteractionValidator;
    private readonly IValidator<CreateCustomerFileDto> _createFileValidator;

    public CustomersController(
        ICustomerService customerService, 
        IValidator<CreateCustomerDto> createValidator,
        IValidator<UpdateCustomerDto> updateValidator,
        IValidator<CreateInteractionDto> createInteractionValidator,
        IValidator<CreateCustomerFileDto> createFileValidator)
    {
        _customerService = customerService;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _createInteractionValidator = createInteractionValidator;
        _createFileValidator = createFileValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _customerService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _customerService.GetByIdAsync(id, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _customerService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşmazlığı.");

        var validationResult = await _updateValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _customerService.UpdateAsync(id, dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // Sadece Admin silebilir
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _customerService.DeleteAsync(id, cancellationToken);
        if (!result) return NotFound();

        return NoContent();
    }
    
    [HttpGet("{id}/interactions")]
    public async Task<IActionResult> GetInteractions(Guid id, CancellationToken cancellationToken)
    {
        var result = await _customerService.GetInteractionsAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id}/interactions")]
    public async Task<IActionResult> AddInteraction(Guid id, [FromBody] CreateInteractionDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createInteractionValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _customerService.AddInteractionAsync(id, dto, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}/files")]
    public async Task<IActionResult> GetFiles(Guid id, CancellationToken cancellationToken)
    {
        var result = await _customerService.GetFilesAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id}/files")]
    public async Task<IActionResult> AddFile(Guid id, [FromBody] CreateCustomerFileDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createFileValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _customerService.AddFileAsync(id, dto, cancellationToken);
        return Ok(result);
    }
}
