using CRM.Application.AuditLogs.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var logs = await _auditLogService.GetAllAsync(cancellationToken);
        return Ok(logs);
    }

    [HttpGet("entity/{entityName}/{entityId}")]
    public async Task<IActionResult> GetByEntity(string entityName, string entityId, CancellationToken cancellationToken)
    {
        var logs = await _auditLogService.GetByEntityAsync(entityName, entityId, cancellationToken);
        return Ok(logs);
    }
}
