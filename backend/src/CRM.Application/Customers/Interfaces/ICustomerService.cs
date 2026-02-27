using CRM.Application.Customers.DTOs;

namespace CRM.Application.Customers.Interfaces;

public interface ICustomerService
{
    Task<IEnumerable<CustomerDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<CustomerDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken cancellationToken);
    Task<CustomerDto?> UpdateAsync(Guid id, UpdateCustomerDto dto, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
    
    Task<IEnumerable<InteractionDto>> GetInteractionsAsync(Guid customerId, CancellationToken cancellationToken);
    Task<InteractionDto> AddInteractionAsync(Guid customerId, CreateInteractionDto dto, CancellationToken cancellationToken);
    
    Task<IEnumerable<CustomerFileDto>> GetFilesAsync(Guid customerId, CancellationToken cancellationToken);
    Task<CustomerFileDto> AddFileAsync(Guid customerId, CreateCustomerFileDto dto, CancellationToken cancellationToken);
}
