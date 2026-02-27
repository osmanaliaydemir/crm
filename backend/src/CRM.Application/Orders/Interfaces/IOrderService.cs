using CRM.Application.Orders.DTOs;

namespace CRM.Application.Orders.Interfaces;

public interface IOrderService
{
    Task<IEnumerable<OrderDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<OrderDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<OrderDto> CreateAsync(CreateOrderDto dto, CancellationToken cancellationToken);
    Task<OrderDto?> UpdateStatusAsync(Guid id, UpdateOrderStatusDto dto, CancellationToken cancellationToken);
}
