using CRM.Application.Common.Interfaces;
using CRM.Application.HR.DTOs;
using CRM.Application.HR.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.HR.Services;

public class LeaveRequestService : ILeaveRequestService
{
    private readonly IApplicationDbContext _context;

    public LeaveRequestService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var requests = await _context.LeaveRequests
            .Include(lr => lr.User)
            .Include(lr => lr.ApprovedBy)
            .AsNoTracking()
            .OrderByDescending(lr => lr.CreatedAt)
            .ToListAsync(cancellationToken);

        return requests.Select(MapToDto);
    }

    public async Task<IEnumerable<LeaveRequestDto>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        var requests = await _context.LeaveRequests
            .Include(lr => lr.User)
            .Include(lr => lr.ApprovedBy)
            .AsNoTracking()
            .Where(lr => lr.UserId == userId)
            .OrderByDescending(lr => lr.CreatedAt)
            .ToListAsync(cancellationToken);

        return requests.Select(MapToDto);
    }

    public async Task<LeaveRequestDto> CreateAsync(CreateLeaveRequestDto dto, CancellationToken cancellationToken)
    {
        var entity = new LeaveRequest
        {
            UserId = dto.UserId,
            Type = dto.Type,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            Status = "Bekliyor"
        };

        _context.LeaveRequests.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var createdRequest = await _context.LeaveRequests
            .Include(lr => lr.User)
            .FirstAsync(lr => lr.Id == entity.Id, cancellationToken);

        return MapToDto(createdRequest);
    }

    public async Task<LeaveRequestDto?> UpdateStatusAsync(UpdateLeaveRequestStatusDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.LeaveRequests
            .Include(lr => lr.User)
            .Include(lr => lr.ApprovedBy)
            .FirstOrDefaultAsync(lr => lr.Id == dto.Id, cancellationToken);

        if (entity == null) return null;

        entity.Status = dto.Status;
        entity.ApprovedById = dto.ApprovedById;

        await _context.SaveChangesAsync(cancellationToken);

        // Rekey approved by to return fresh dto name
        var updated = await _context.LeaveRequests
            .Include(lr => lr.User)
            .Include(lr => lr.ApprovedBy)
            .FirstAsync(lr => lr.Id == dto.Id, cancellationToken);

        return MapToDto(updated);
    }

    private static LeaveRequestDto MapToDto(LeaveRequest lr) => new()
    {
        Id = lr.Id,
        UserId = lr.UserId,
        UserName = lr.User?.Name ?? string.Empty,
        Type = lr.Type,
        StartDate = lr.StartDate,
        EndDate = lr.EndDate,
        Reason = lr.Reason,
        Status = lr.Status,
        ApprovedByName = lr.ApprovedBy?.Name,
        CreatedAt = lr.CreatedAt
    };
}

public class ExpenseService : IExpenseService
{
    private readonly IApplicationDbContext _context;

    public ExpenseService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var expenses = await _context.Expenses
            .Include(e => e.User)
            .Include(e => e.ApprovedBy)
            .AsNoTracking()
            .OrderByDescending(e => e.Date)
            .ToListAsync(cancellationToken);

        return expenses.Select(MapToDto);
    }

    public async Task<IEnumerable<ExpenseDto>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        var expenses = await _context.Expenses
            .Include(e => e.User)
            .Include(e => e.ApprovedBy)
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.Date)
            .ToListAsync(cancellationToken);

        return expenses.Select(MapToDto);
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseDto dto, CancellationToken cancellationToken)
    {
        var entity = new Expense
        {
            UserId = dto.UserId,
            Category = dto.Category,
            Amount = dto.Amount,
            Date = dto.Date,
            Description = dto.Description,
            Status = "Bekliyor"
        };

        _context.Expenses.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var created = await _context.Expenses
            .Include(e => e.User)
            .FirstAsync(e => e.Id == entity.Id, cancellationToken);
            
        return MapToDto(created);
    }

    public async Task<ExpenseDto?> UpdateStatusAsync(UpdateExpenseStatusDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Expenses
            .Include(e => e.User)
            .Include(e => e.ApprovedBy)
            .FirstOrDefaultAsync(e => e.Id == dto.Id, cancellationToken);

        if (entity == null) return null;

        entity.Status = dto.Status;
        entity.ApprovedById = dto.ApprovedById;

        await _context.SaveChangesAsync(cancellationToken);

        var updated = await _context.Expenses
            .Include(e => e.User)
            .Include(e => e.ApprovedBy)
            .FirstAsync(e => e.Id == dto.Id, cancellationToken);

        return MapToDto(updated);
    }

    private static ExpenseDto MapToDto(Expense e) => new()
    {
        Id = e.Id,
        UserId = e.UserId,
        UserName = e.User?.Name ?? string.Empty,
        Category = e.Category,
        Amount = e.Amount,
        Date = e.Date,
        Description = e.Description,
        Status = e.Status,
        ReceiptPath = e.ReceiptPath,
        ApprovedByName = e.ApprovedBy?.Name,
        CreatedAt = e.CreatedAt
    };
}
