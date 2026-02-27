using CRM.Application.Reports.DTOs;
using CRM.Application.Reports.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class ReportsController : ControllerBase
{
    private readonly IReportingService _reportingService;

    public ReportsController(IReportingService reportingService)
    {
        _reportingService = reportingService;
    }

    [HttpGet("dashboard-summary")]
    public async Task<IActionResult> GetDashboardSummary(CancellationToken cancellationToken)
    {

        var result = await _reportingService.GetDashboardSummaryAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("monthly-financial")]
    public async Task<IActionResult> GetMonthlyFinancial([FromQuery] int year, CancellationToken cancellationToken)
    {
        if (year < 2000 || year > 2100) year = DateTime.UtcNow.Year; // Hatalı bir yıl gelirse varsayılan

        var result = await _reportingService.GetMonthlyFinancialSummaryAsync(year, cancellationToken);
        return Ok(result);
    }

    [HttpGet("sales-performance")]
    public async Task<IActionResult> GetSalesPerformanceSummary(
        [FromQuery] DateTime? startDate, 
        [FromQuery] DateTime? endDate, 
        CancellationToken cancellationToken)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        if (end < start)
            return BadRequest("Bitiş tarihi başlangıç tarihinden önce olamaz.");

        var result = await _reportingService.GetSalesPerformanceAsync(start, end, cancellationToken);
        return Ok(result);
    }

    [HttpGet("project-status-distribution")]
    public async Task<IActionResult> GetProjectDistribution(CancellationToken cancellationToken)
    {
        var result = await _reportingService.GetProjectStatusDistributionAsync(cancellationToken);
        return Ok(result);
    }
}
