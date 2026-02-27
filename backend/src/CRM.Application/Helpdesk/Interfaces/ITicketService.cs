using CRM.Application.Helpdesk.DTOs;

namespace CRM.Application.Helpdesk.Interfaces;

public interface ITicketService
{
    Task<IEnumerable<TicketDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IEnumerable<TicketDto>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken);
    Task<TicketDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    
    Task<TicketDto> CreateAsync(CreateTicketDto dto, Guid? createdByUserId, CancellationToken cancellationToken);
    Task<TicketDto?> UpdateStatusAsync(UpdateTicketStatusDto dto, CancellationToken cancellationToken);
    Task<TicketDto?> AssignToAsync(AssignTicketDto dto, CancellationToken cancellationToken);
    
    Task<TicketCommentDto> AddCommentAsync(CreateTicketCommentDto dto, Guid userId, CancellationToken cancellationToken);
}
