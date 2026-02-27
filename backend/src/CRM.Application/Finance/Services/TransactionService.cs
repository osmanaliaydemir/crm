using CRM.Application.Common.Interfaces;
using CRM.Application.Finance.DTOs;
using CRM.Application.Finance.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Finance.Services;

public class TransactionService : ITransactionService
{
    private readonly IApplicationDbContext _context;

    public TransactionService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TransactionDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var transactions = await _context.Transactions
            .AsNoTracking()
            .OrderByDescending(x => x.Date)
            .ToListAsync(cancellationToken);

        return transactions.Select(t => new TransactionDto
        {
            Id = t.Id,
            Date = t.Date,
            Description = t.Description,
            Type = t.Type,
            Category = t.Category,
            Amount = t.Amount,
            Status = t.Status,
            AccountId = t.AccountId
        });
    }

    public async Task<TransactionDto> CreateAsync(CreateTransactionDto dto, CancellationToken cancellationToken)
    {
        var entity = new Transaction
        {
            Date = dto.Date,
            Description = dto.Description,
            Type = dto.Type,
            Category = dto.Category,
            Amount = dto.Amount,
            Status = dto.Status,
            AccountId = dto.AccountId
        };

        if (dto.AccountId.HasValue && dto.Status == "Tamamlandı")
        {
            var account = await _context.BankAccounts.FindAsync(new object[] { dto.AccountId.Value }, cancellationToken);
            if (account != null)
            {
                if (dto.Type == "in") account.Balance += dto.Amount;
                else account.Balance -= dto.Amount;
            }
        }

        _context.Transactions.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return new TransactionDto
        {
            Id = entity.Id,
            Date = entity.Date,
            Description = entity.Description,
            Type = entity.Type,
            Category = entity.Category,
            Amount = entity.Amount,
            Status = entity.Status,
            AccountId = entity.AccountId
        };
    }

    public async Task<TransactionDto?> UpdateStatusAsync(UpdateTransactionStatusDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == dto.Id, cancellationToken);

        if (entity == null) return null;

        // If it changes from pending to completed, update balance
        if (entity.Status != "Tamamlandı" && dto.Status == "Tamamlandı" && entity.Account != null)
        {
            if (entity.Type == "in") entity.Account.Balance += entity.Amount;
            else entity.Account.Balance -= entity.Amount;
        }
        // If it changes from completed to something else, revert balance
        else if (entity.Status == "Tamamlandı" && dto.Status != "Tamamlandı" && entity.Account != null)
        {
            if (entity.Type == "in") entity.Account.Balance -= entity.Amount;
            else entity.Account.Balance += entity.Amount;
        }

        entity.Status = dto.Status;
        await _context.SaveChangesAsync(cancellationToken);

        return new TransactionDto
        {
            Id = entity.Id,
            Date = entity.Date,
            Description = entity.Description,
            Type = entity.Type,
            Category = entity.Category,
            Amount = entity.Amount,
            Status = entity.Status,
            AccountId = entity.AccountId
        };
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _context.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (entity == null) return false;

        if (entity.Status == "Tamamlandı" && entity.Account != null)
        {
            if (entity.Type == "in") entity.Account.Balance -= entity.Amount;
            else entity.Account.Balance += entity.Amount;
        }

        _context.Transactions.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
