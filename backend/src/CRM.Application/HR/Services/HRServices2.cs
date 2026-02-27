using CRM.Application.Common.Interfaces;
using CRM.Application.HR.DTOs;
using CRM.Application.HR.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.HR.Services;

public class PerformanceService : IPerformanceService
{
    private readonly IApplicationDbContext _context;

    public PerformanceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PerformanceEvaluationDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var evaluations = await _context.PerformanceEvaluations
            .Include(pe => pe.Employee)
            .Include(pe => pe.Evaluator)
            .AsNoTracking()
            .OrderByDescending(pe => pe.EvaluationDate)
            .ToListAsync(cancellationToken);

        return evaluations.Select(MapToDto);
    }

    public async Task<IEnumerable<PerformanceEvaluationDto>> GetByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken)
    {
        var evaluations = await _context.PerformanceEvaluations
            .Include(pe => pe.Employee)
            .Include(pe => pe.Evaluator)
            .AsNoTracking()
            .Where(pe => pe.EmployeeId == employeeId)
            .OrderByDescending(pe => pe.EvaluationDate)
            .ToListAsync(cancellationToken);

        return evaluations.Select(MapToDto);
    }

    public async Task<PerformanceEvaluationDto> CreateAsync(CreatePerformanceEvaluationDto dto, CancellationToken cancellationToken)
    {
        var entity = new PerformanceEvaluation
        {
            EmployeeId = dto.EmployeeId,
            EvaluatorId = dto.EvaluatorId,
            Score = dto.Score,
            Feedback = dto.Feedback,
            EvaluationDate = dto.EvaluationDate,
            Period = dto.Period
        };

        _context.PerformanceEvaluations.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var created = await _context.PerformanceEvaluations
            .Include(pe => pe.Employee)
            .Include(pe => pe.Evaluator)
            .FirstAsync(pe => pe.Id == entity.Id, cancellationToken);
            
        return MapToDto(created);
    }

    private static PerformanceEvaluationDto MapToDto(PerformanceEvaluation pe) => new()
    {
        Id = pe.Id,
        EmployeeId = pe.EmployeeId,
        EmployeeName = pe.Employee?.Name ?? string.Empty,
        EvaluatorId = pe.EvaluatorId,
        EvaluatorName = pe.Evaluator?.Name ?? string.Empty,
        Score = pe.Score,
        Feedback = pe.Feedback,
        EvaluationDate = pe.EvaluationDate,
        Period = pe.Period
    };
}

public class PayrollService : IPayrollService
{
    private readonly IApplicationDbContext _context;

    public PayrollService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PayrollDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var payrolls = await _context.Payrolls
            .Include(p => p.Employee)
            .AsNoTracking()
            .OrderByDescending(p => p.Period)
            .ToListAsync(cancellationToken);

        return payrolls.Select(MapToDto);
    }

    public async Task<IEnumerable<PayrollDto>> GetByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken)
    {
        var payrolls = await _context.Payrolls
            .Include(p => p.Employee)
            .AsNoTracking()
            .Where(p => p.EmployeeId == employeeId)
            .OrderByDescending(p => p.Period)
            .ToListAsync(cancellationToken);

        return payrolls.Select(MapToDto);
    }

    public async Task<PayrollDto> CreateAsync(CreatePayrollDto dto, CancellationToken cancellationToken)
    {
        var netSalary = (dto.BasicSalary + dto.Bonus) - dto.Deductions;
        
        var entity = new Payroll
        {
            EmployeeId = dto.EmployeeId,
            Period = dto.Period,
            BasicSalary = dto.BasicSalary,
            Bonus = dto.Bonus,
            Deductions = dto.Deductions,
            NetSalary = netSalary,
            Status = "Taslak"
        };

        _context.Payrolls.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var created = await _context.Payrolls
            .Include(p => p.Employee)
            .FirstAsync(p => p.Id == entity.Id, cancellationToken);

        return MapToDto(created);
    }

    public async Task<PayrollDto?> UpdateStatusAsync(UpdatePayrollStatusDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Payrolls
            .Include(p => p.Employee)
            .FirstOrDefaultAsync(p => p.Id == dto.Id, cancellationToken);

        if (entity == null) return null;

        entity.Status = dto.Status;
        if (dto.PaymentDate.HasValue)
        {
            entity.PaymentDate = dto.PaymentDate;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    private static PayrollDto MapToDto(Payroll p) => new()
    {
        Id = p.Id,
        EmployeeId = p.EmployeeId,
        EmployeeName = p.Employee?.Name ?? string.Empty,
        Period = p.Period,
        BasicSalary = p.BasicSalary,
        Bonus = p.Bonus,
        Deductions = p.Deductions,
        NetSalary = p.NetSalary,
        Status = p.Status,
        PaymentDate = p.PaymentDate
    };
}
