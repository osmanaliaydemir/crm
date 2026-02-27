using CRM.Application.Common.Interfaces;
using CRM.Application.Finance.DTOs;
using CRM.Application.Finance.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Finance.Services;

public class BankAccountService : IBankAccountService
{
    private readonly IApplicationDbContext _context;

    public BankAccountService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<BankAccountDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var accounts = await _context.BankAccounts
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return accounts.Select(a => new BankAccountDto
        {
            Id = a.Id,
            Name = a.Name,
            Type = a.Type,
            Detail = a.Detail,
            Balance = a.Balance
        });
    }

    public async Task<BankAccountDto> CreateAsync(CreateBankAccountDto dto, CancellationToken cancellationToken)
    {
        var entity = new BankAccount
        {
            Name = dto.Name,
            Type = dto.Type,
            Detail = dto.Detail,
            Balance = dto.InitialBalance
        };

        _context.BankAccounts.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return new BankAccountDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Type = entity.Type,
            Detail = entity.Detail,
            Balance = entity.Balance
        };
    }
}
