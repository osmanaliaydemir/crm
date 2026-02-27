using CRM.Application.Inventory.DTOs;

namespace CRM.Application.Inventory.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken);
    Task<ProductDto?> UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}

public interface IStockMovementService
{
    Task<IEnumerable<StockMovementDto>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken);
    Task<StockMovementDto> AddMovementAsync(CreateStockMovementDto dto, CancellationToken cancellationToken);
}
