using CRM.Application.Finance.DTOs;
using CRM.Application.Finance.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "FinanceAccess")]
public class BankAccountsController : ControllerBase
{
    private readonly IBankAccountService _bankAccountService;
    private readonly IValidator<CreateBankAccountDto> _createValidator;

    public BankAccountsController(IBankAccountService bankAccountService, IValidator<CreateBankAccountDto> createValidator)
    {
        _bankAccountService = bankAccountService;
        _createValidator = createValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _bankAccountService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBankAccountDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _bankAccountService.CreateAsync(dto, cancellationToken);
        return Ok(result);
    }
}
