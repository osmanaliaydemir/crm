using CRM.Application.Finance.DTOs;

namespace CRM.Application.Finance.Interfaces;

public interface ITransactionService
{
    Task<IEnumerable<TransactionDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<TransactionDto> CreateAsync(CreateTransactionDto dto, CancellationToken cancellationToken);
    Task<TransactionDto?> UpdateStatusAsync(UpdateTransactionStatusDto dto, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}

public interface IBankAccountService
{
    Task<IEnumerable<BankAccountDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<BankAccountDto> CreateAsync(CreateBankAccountDto dto, CancellationToken cancellationToken);
}

public interface IInvoiceService
{
    Task<IEnumerable<InvoiceDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<InvoiceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto, CancellationToken cancellationToken);
}
