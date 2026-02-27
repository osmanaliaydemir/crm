using System.Security.Claims;
using CRM.Application.Common.Interfaces;
using CRM.Application.Portal.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "B2BAccess")] // Customers and Admins
public class PortalController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public PortalController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Forbidden();

        var orders = await _context.Orders
            .Where(o => o.CustomerId == customerId.Value)
            .ToListAsync(cancellationToken);

        var invoices = await _context.Invoices
            .Where(i => i.CustomerId == customerId.Value)
            .ToListAsync(cancellationToken);

        var summary = new PortalSummaryDto
        {
            TotalOrderAmount = orders.Sum(o => o.TotalAmount),
            TotalInvoiceAmount = invoices.Sum(i => i.TotalAmount),
            PendingPaymentAmount = invoices.Where(i => i.Status != "Paid").Sum(i => i.TotalAmount),
            OutstandingBalance = invoices.Where(i => i.Status != "Paid").Sum(i => i.TotalAmount) // Basic logic
        };

        return Ok(summary);
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(CancellationToken cancellationToken)
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Forbidden();

        var orders = await _context.Orders
            .Where(o => o.CustomerId == customerId.Value)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new PortalOrderDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                OrderDate = o.CreatedAt,
                TotalAmount = o.TotalAmount,
                Status = o.Status
            })
            .ToListAsync(cancellationToken);

        return Ok(orders);
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> GetInvoices(CancellationToken cancellationToken)
    {
        var customerId = GetCustomerId();
        if (customerId == null) return Forbidden();

        var invoices = await _context.Invoices
            .Where(i => i.CustomerId == customerId.Value)
            .OrderByDescending(i => i.IssueDate)
            .Select(i => new PortalInvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                InvoiceDate = i.IssueDate,
                TotalAmount = i.TotalAmount,
                DueDate = i.DueDate,
                Status = i.Status
            })
            .ToListAsync(cancellationToken);

        return Ok(invoices);
    }

    private Guid? GetCustomerId()
    {
        // If Admin is calling, they might pass customerId as query param or we just return null for now.
        // For B2B Portal, we expect the customer_id claim.
        var customerIdClaim = User.Claims.FirstOrDefault(c => c.Type == "customer_id")?.Value;
        if (string.IsNullOrEmpty(customerIdClaim)) return null;
        return Guid.Parse(customerIdClaim);
    }

    private IActionResult Forbidden() => StatusCode(403, new { message = "Bu işlem için müşteri yetkisi gereklidir." });
}
