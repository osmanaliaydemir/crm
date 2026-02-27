using CRM.Application.HR.DTOs;

namespace CRM.Application.HR.Interfaces;

public interface ILeaveRequestService
{
    Task<IEnumerable<LeaveRequestDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<LeaveRequestDto>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<LeaveRequestDto> CreateAsync(CreateLeaveRequestDto dto, CancellationToken cancellationToken);
    Task<LeaveRequestDto?> UpdateStatusAsync(UpdateLeaveRequestStatusDto dto, CancellationToken cancellationToken);
}

public interface IExpenseService
{
    Task<IEnumerable<ExpenseDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<ExpenseDto>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<ExpenseDto> CreateAsync(CreateExpenseDto dto, CancellationToken cancellationToken);
    Task<ExpenseDto?> UpdateStatusAsync(UpdateExpenseStatusDto dto, CancellationToken cancellationToken);
}

public interface IPerformanceService
{
    Task<IEnumerable<PerformanceEvaluationDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<PerformanceEvaluationDto>> GetByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken);
    Task<PerformanceEvaluationDto> CreateAsync(CreatePerformanceEvaluationDto dto, CancellationToken cancellationToken);
}

public interface IPayrollService
{
    Task<IEnumerable<PayrollDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<PayrollDto>> GetByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken);
    Task<PayrollDto> CreateAsync(CreatePayrollDto dto, CancellationToken cancellationToken);
    Task<PayrollDto?> UpdateStatusAsync(UpdatePayrollStatusDto dto, CancellationToken cancellationToken);
}
