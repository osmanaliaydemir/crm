using CRM.Application.Common.Interfaces;
using CRM.Application.Finance.DTOs;
using CRM.Application.Finance.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Finance.Services;

public class InvoiceService : IInvoiceService
{
    private readonly IApplicationDbContext _context;

    public InvoiceService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InvoiceDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var invoices = await _context.Invoices
            .Include(i => i.Customer)
            .AsNoTracking()
            .OrderByDescending(x => x.IssueDate)
            .ToListAsync(cancellationToken);

        return invoices.Select(i => new InvoiceDto
        {
            Id = i.Id,
            InvoiceNumber = i.InvoiceNumber,
            CustomerId = i.CustomerId,
            CustomerName = i.Customer != null ? i.Customer.Name : string.Empty,
            IssueDate = i.IssueDate,
            DueDate = i.DueDate,
            SubTotal = i.SubTotal,
            TaxRate = i.TaxRate,
            TaxAmount = i.TaxAmount,
            TotalAmount = i.TotalAmount,
            Status = i.Status,
            Notes = i.Notes
        });
    }

    public async Task<InvoiceDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (invoice == null) return null;

        return new InvoiceDto
        {
            Id = invoice.Id,
            InvoiceNumber = invoice.InvoiceNumber,
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer != null ? invoice.Customer.Name : string.Empty,
            IssueDate = invoice.IssueDate,
            DueDate = invoice.DueDate,
            SubTotal = invoice.SubTotal,
            TaxRate = invoice.TaxRate,
            TaxAmount = invoice.TaxAmount,
            TotalAmount = invoice.TotalAmount,
            Status = invoice.Status,
            Notes = invoice.Notes,
            Items = invoice.Items.Select(i => new InvoiceItemDto
            {
                Id = i.Id,
                InvoiceId = i.InvoiceId,
                Description = i.Description,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice
            }).ToList()
        };
    }

    public async Task<InvoiceDto> CreateAsync(CreateInvoiceDto dto, CancellationToken cancellationToken)
    {
        var entity = new Invoice
        {
            InvoiceNumber = dto.InvoiceNumber,
            CustomerId = dto.CustomerId,
            IssueDate = dto.IssueDate,
            DueDate = dto.DueDate,
            TaxRate = dto.TaxRate,
            Status = dto.Status,
            Notes = dto.Notes
        };

        decimal subTotal = 0;

        foreach (var itemDto in dto.Items)
        {
            var itemTotal = itemDto.Quantity * itemDto.UnitPrice;
            subTotal += itemTotal;

            entity.Items.Add(new InvoiceItem
            {
                Description = itemDto.Description,
                Quantity = itemDto.Quantity,
                UnitPrice = itemDto.UnitPrice,
                TotalPrice = itemTotal
            });
        }

        entity.SubTotal = subTotal;
        entity.TaxAmount = subTotal * (dto.TaxRate / 100m);
        entity.TotalAmount = entity.SubTotal + entity.TaxAmount;

        _context.Invoices.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        // Fetch to return full DTO 
        return await GetByIdAsync(entity.Id, cancellationToken) ?? throw new InvalidOperationException("Fatura oluşturulamadı.");
    }
}
