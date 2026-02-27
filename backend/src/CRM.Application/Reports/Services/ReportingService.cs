using CRM.Application.Common.Interfaces;
using CRM.Application.Reports.DTOs;
using CRM.Application.Reports.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Reports.Services;

public class ReportingService : IReportingService
{
    private readonly IApplicationDbContext _context;

    public ReportingService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken)
    {
        var dto = new DashboardSummaryDto();

        // Finans
        dto.TotalRevenue = await _context.Transactions
            .Where(t => t.Type == "Gelir" && t.Status == "Onaylandı")
            .SumAsync(t => t.Amount, cancellationToken);
            
        dto.TotalExpenses = await _context.Transactions
            .Where(t => t.Type == "Gider" && t.Status == "Onaylandı")
            .SumAsync(t => t.Amount, cancellationToken);

        // Müşteri & Sipariş
        dto.TotalCustomers = await _context.Customers.CountAsync(cancellationToken);
        dto.ActiveOrders = await _context.Orders
            .Where(o => o.Status != "Teslim Edildi" && o.Status != "İptal Eklendi") // Teslim edilmemiş siparişler (Hazırlanıyor vs)
            .CountAsync(cancellationToken);

        // Operasyon
        dto.ActiveProjects = await _context.Projects
            .Where(p => p.Status == "Aktif")
            .CountAsync(cancellationToken);
            
        dto.OpenTickets = await _context.Tickets
            .Where(t => t.Status != "Çözüldü" && t.Status != "Kapalı")
            .CountAsync(cancellationToken);

        // İK
        dto.PendingLeaveRequests = await _context.LeaveRequests
            .Where(l => l.Status == "Bekliyor")
            .CountAsync(cancellationToken);

        return dto;
    }

    public async Task<IEnumerable<MonthlyFinancialSummaryDto>> GetMonthlyFinancialSummaryAsync(int year, CancellationToken cancellationToken)
    {
        var result = new List<MonthlyFinancialSummaryDto>();

        // Optimizasyon için veriyi DB'den sadece ilgili yılı çekip gruplayalım
        var records = await _context.Transactions
            .Where(t => t.Date.Year == year && t.Status == "Onaylandı")
            .GroupBy(t => t.Date.Month)
            .Select(g => new 
            {
                Month = g.Key,
                Income = g.Where(x => x.Type == "Gelir").Sum(x => x.Amount),
                Expense = g.Where(x => x.Type == "Gider").Sum(x => x.Amount)
            })
            .ToListAsync(cancellationToken);

        // 1'den 12'ye kadar dolduralım, boş olanları 0 ile gidelim
        for (int i = 1; i <= 12; i++)
        {
            var monthData = records.FirstOrDefault(r => r.Month == i);
            result.Add(new MonthlyFinancialSummaryDto
            {
                Month = $"{year}-{i:D2}",
                Income = monthData?.Income ?? 0,
                Expense = monthData?.Expense ?? 0
            });
        }

        return result;
    }

    public async Task<IEnumerable<SalesPerformanceDto>> GetSalesPerformanceAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var salesData = await _context.Orders
            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status != "İptal Edildi")
            .Include(o => o.Customer)
            .Where(o => o.Customer != null)
            .GroupBy(o => new { o.CustomerId, CustomerName = o.Customer!.Name })
            .Select(g => new SalesPerformanceDto
            {
                EmployeeName = "Müşteri: " + (g.Key.CustomerName ?? "Bilinmiyor"),
                TotalOrders = g.Count(),
                TotalSalesAmount = g.Sum(x => x.TotalAmount)
            })
            .OrderByDescending(x => x.TotalSalesAmount)
            .ToListAsync(cancellationToken);

        return salesData;
    }

    public async Task<IEnumerable<ProjectStatusSummaryDto>> GetProjectStatusDistributionAsync(CancellationToken cancellationToken)
    {
        var statuses = await _context.Projects
            .GroupBy(p => p.Status)
            .Select(g => new ProjectStatusSummaryDto
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);

        return statuses;
    }
}
