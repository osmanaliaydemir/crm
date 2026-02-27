using CRM.Application.Common.Interfaces;
using CRM.Application.Inventory.DTOs;
using CRM.Application.Inventory.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Inventory.Services;

public class StockMovementService : IStockMovementService
{
    private readonly IApplicationDbContext _context;

    public StockMovementService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StockMovementDto>> GetByProductIdAsync(Guid productId, CancellationToken cancellationToken)
    {
        var movements = await _context.StockMovements
            .AsNoTracking()
            .Where(sm => sm.ProductId == productId)
            .OrderByDescending(sm => sm.Date)
            .ToListAsync(cancellationToken);

        return movements.Select(sm => new StockMovementDto
        {
            Id = sm.Id,
            ProductId = sm.ProductId,
            Type = sm.Type,
            Quantity = sm.Quantity,
            Date = sm.Date,
            Description = sm.Description
        });
    }

    public async Task<StockMovementDto> AddMovementAsync(CreateStockMovementDto dto, CancellationToken cancellationToken)
    {
        var product = await _context.Products.FindAsync(new object[] { dto.ProductId }, cancellationToken)
                      ?? throw new InvalidOperationException("Ürün bulunamadı.");

        var movement = new StockMovement
        {
            ProductId = dto.ProductId,
            Type = dto.Type,
            Quantity = dto.Quantity,
            Date = dto.Date,
            Description = dto.Description
        };

        // Update product stock balance based on movement type
        if (dto.Type == "Giriş" || dto.Type == "İade")
        {
            product.StockQuantity += dto.Quantity;
        }
        else if (dto.Type == "Çıkış")
        {
            if (product.StockQuantity < dto.Quantity)
            {
                throw new InvalidOperationException("Yetersiz stok miktarı. Lütfen miktarı kontrol edin veya güncelleyin.");
            }
            product.StockQuantity -= dto.Quantity;
        }

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync(cancellationToken);

        return new StockMovementDto
        {
            Id = movement.Id,
            ProductId = movement.ProductId,
            Type = movement.Type,
            Quantity = movement.Quantity,
            Date = movement.Date,
            Description = movement.Description
        };
    }
}
