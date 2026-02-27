using CRM.Application.Inventory.DTOs;
using CRM.Application.Inventory.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SalesAccess")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IStockMovementService _stockMovementService;
    private readonly IValidator<CreateProductDto> _createProductValidator;
    private readonly IValidator<UpdateProductDto> _updateProductValidator;
    private readonly IValidator<CreateStockMovementDto> _createStockMovementValidator;

    public ProductsController(
        IProductService productService,
        IStockMovementService stockMovementService,
        IValidator<CreateProductDto> createProductValidator,
        IValidator<UpdateProductDto> updateProductValidator,
        IValidator<CreateStockMovementDto> createStockMovementValidator)
    {
        _productService = productService;
        _stockMovementService = stockMovementService;
        _createProductValidator = createProductValidator;
        _updateProductValidator = updateProductValidator;
        _createStockMovementValidator = createStockMovementValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _productService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _productService.GetByIdAsync(id, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createProductValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _productService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _updateProductValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _productService.UpdateAsync(id, dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _productService.DeleteAsync(id, cancellationToken);
        if (!result) return NotFound();

        return NoContent();
    }

    [HttpGet("{id}/stock-movements")]
    public async Task<IActionResult> GetStockMovements(Guid id, CancellationToken cancellationToken)
    {
        var result = await _stockMovementService.GetByProductIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id}/stock-movements")]
    public async Task<IActionResult> AddStockMovement(Guid id, [FromBody] CreateStockMovementDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.ProductId) return BadRequest("ID uyuşulmuyor");

        var validationResult = await _createStockMovementValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _stockMovementService.AddMovementAsync(dto, cancellationToken);
        return Ok(result);
    }
}
