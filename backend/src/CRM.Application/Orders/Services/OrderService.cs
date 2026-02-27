using CRM.Application.Common.Interfaces;
using CRM.Application.Orders.DTOs;
using CRM.Application.Orders.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _context;

    public OrderService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OrderDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var orders = await _context.Orders
            .Include(o => o.Customer)
            .AsNoTracking()
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync(cancellationToken);

        return orders.Select(o => new OrderDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerId = o.CustomerId,
            CustomerName = o.Customer?.Name ?? string.Empty,
            OrderDate = o.OrderDate,
            DeliveryDate = o.DeliveryDate,
            TotalAmount = o.TotalAmount,
            Status = o.Status
        });
    }

    public async Task<OrderDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var order = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order == null) return null;

        return new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerId = order.CustomerId,
            CustomerName = order.Customer?.Name ?? string.Empty,
            OrderDate = order.OrderDate,
            DeliveryDate = order.DeliveryDate,
            TotalAmount = order.TotalAmount,
            Status = order.Status,
            Items = order.Items.Select(i => new OrderItemDto
            {
                Id = i.Id,
                OrderId = i.OrderId,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? string.Empty,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }

    public async Task<OrderDto> CreateAsync(CreateOrderDto dto, CancellationToken cancellationToken)
    {
        var entity = new Order
        {
            OrderNumber = dto.OrderNumber,
            CustomerId = dto.CustomerId,
            OrderDate = dto.OrderDate,
            DeliveryDate = dto.DeliveryDate,
            Status = "Yeni"
        };

        decimal totalAmount = 0;

        foreach (var itemDto in dto.Items)
        {
            var product = await _context.Products.FindAsync(new object[] { itemDto.ProductId }, cancellationToken)
                ?? throw new InvalidOperationException($"Product with ID {itemDto.ProductId} not found.");

            if (product.StockQuantity < itemDto.Quantity)
                throw new InvalidOperationException($"Ürün için yetersiz stok: {product.Name}");

            // Stok Düşümü (Stock Deduction)
            product.StockQuantity -= itemDto.Quantity;
            
            // Stok Hareketi Kaydı (Stock Movement Log)
            _context.StockMovements.Add(new StockMovement
            {
                ProductId = product.Id,
                Type = "Çıkış",
                Quantity = itemDto.Quantity,
                Date = DateTime.UtcNow,
                Description = $"Sipariş oluşturuldu: {entity.OrderNumber}"
            });

            var itemTotal = itemDto.Quantity * itemDto.UnitPrice;
            totalAmount += itemTotal;

            entity.Items.Add(new OrderItem
            {
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                TotalPrice = itemTotal
            });
        }

        entity.TotalAmount = totalAmount;

        _context.Orders.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.Id, cancellationToken) ?? throw new Exception("Order creation failed.");
    }

    public async Task<OrderDto?> UpdateStatusAsync(Guid id, UpdateOrderStatusDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (entity == null) return null;

        // Sipariş iptal edilirse stokları geri yükle
        if (entity.Status != "İptal" && dto.Status == "İptal")
        {
            foreach (var item in entity.Items)
            {
                var product = await _context.Products.FindAsync(new object[] { item.ProductId }, cancellationToken);
                if (product != null)
                {
                    product.StockQuantity += item.Quantity;
                    
                    _context.StockMovements.Add(new StockMovement
                    {
                        ProductId = product.Id,
                        Type = "Giriş", // İade/İptal girişi
                        Quantity = item.Quantity,
                        Date = DateTime.UtcNow,
                        Description = $"Sipariş iptal edildi: {entity.OrderNumber}"
                    });
                }
            }
        }

        entity.Status = dto.Status;
        if (dto.DeliveryDate.HasValue)
        {
            entity.DeliveryDate = dto.DeliveryDate;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }
}
