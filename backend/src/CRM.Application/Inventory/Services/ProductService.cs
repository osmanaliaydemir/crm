using CRM.Application.Common.Interfaces;
using CRM.Application.Inventory.DTOs;
using CRM.Application.Inventory.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Inventory.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _context;

    public ProductService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var products = await _context.Products
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return products.Select(MapToDto);
    }

    public async Task<ProductDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        return entity == null ? null : MapToDto(entity);
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, CancellationToken cancellationToken)
    {
        var entity = new Product
        {
            Name = dto.Name,
            SKU = dto.SKU,
            Category = dto.Category,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            MinimumStockLevel = dto.MinimumStockLevel,
            Status = dto.Status
        };

        _context.Products.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<ProductDto?> UpdateAsync(Guid id, UpdateProductDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Products.FindAsync(new object[] { id }, cancellationToken);

        if (entity == null) return null;

        entity.Name = dto.Name;
        entity.SKU = dto.SKU;
        entity.Category = dto.Category;
        entity.Price = dto.Price;
        entity.StockQuantity = dto.StockQuantity;
        entity.MinimumStockLevel = dto.MinimumStockLevel;
        entity.Status = dto.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _context.Products.FindAsync(new object[] { id }, cancellationToken);

        if (entity == null) return false;

        _context.Products.Remove(entity); // Soft Delete
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ProductDto MapToDto(Product entity)
    {
        return new ProductDto
        {
            Id = entity.Id,
            Name = entity.Name,
            SKU = entity.SKU,
            Category = entity.Category,
            Price = entity.Price,
            StockQuantity = entity.StockQuantity,
            MinimumStockLevel = entity.MinimumStockLevel,
            Status = entity.Status
        };
    }
}
