using CRM.Application.Reports.DTOs;

namespace CRM.Application.Reports.Interfaces;

public interface IReportingService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(CancellationToken cancellationToken);
    
    // Yıllık bazda veya son 6 aydaki finansal özet
    Task<IEnumerable<MonthlyFinancialSummaryDto>> GetMonthlyFinancialSummaryAsync(int year, CancellationToken cancellationToken);
    
    // Satış personeli performansı
    Task<IEnumerable<SalesPerformanceDto>> GetSalesPerformanceAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken);
    
    // Projelerin durum dağılımı grafikleri için
    Task<IEnumerable<ProjectStatusSummaryDto>> GetProjectStatusDistributionAsync(CancellationToken cancellationToken);
}
