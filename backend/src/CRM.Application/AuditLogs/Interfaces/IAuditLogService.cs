using CRM.Application.AuditLogs.DTOs;

namespace CRM.Application.AuditLogs.Interfaces;

public interface IAuditLogService
{
    Task<List<AuditLogDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<List<AuditLogDto>> GetByEntityAsync(string entityName, string entityId, CancellationToken cancellationToken);
}
