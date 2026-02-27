namespace CRM.Application.Reports.DTOs;

public class DashboardSummaryDto
{
    // Finansal Özetler
    public decimal TotalRevenue { get; set; } // Tamamlanan/Ödenen Faturalar toplamı
    public decimal TotalExpenses { get; set; } // Onaylanan masraflar + Gider türü işlemler
    public decimal NetProfit => TotalRevenue - TotalExpenses;

    // Satış ve Müşteri
    public int TotalCustomers { get; set; }
    public int ActiveOrders { get; set; } // Teslim edilmemiş siparişler

    // Operasyonel Veriler
    public int ActiveProjects { get; set; }
    public int OpenTickets { get; set; } // Açık, İncelemede veya Beklemede
    
    // İK Özetleri
    public int PendingLeaveRequests { get; set; }
}

public class MonthlyFinancialSummaryDto
{
    public string Month { get; set; } = string.Empty; // "Ocak", "Şubat" vs veya "2024-01"
    public decimal Income { get; set; }
    public decimal Expense { get; set; }
    public decimal Profit => Income - Expense;
}

public class SalesPerformanceDto
{
    public string EmployeeName { get; set; } = string.Empty;
    public int TotalOrders { get; set; }
    public decimal TotalSalesAmount { get; set; }
}

public class ProjectStatusSummaryDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
