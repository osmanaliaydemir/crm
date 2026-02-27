using CRM.Application.AuditLogs.DTOs;
using CRM.Application.AuditLogs.Interfaces;
using CRM.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.AuditLogs.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IApplicationDbContext _context;

    public AuditLogService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLogDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _context.AuditLogs
            .OrderByDescending(x => x.Timestamp)
            .Take(100)
            .Select(x => new AuditLogDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserEmail = x.UserEmail,
                Action = x.Action,
                EntityName = x.EntityName,
                EntityId = x.EntityId,
                OldValues = x.OldValues,
                NewValues = x.NewValues,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                Timestamp = x.Timestamp
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<AuditLogDto>> GetByEntityAsync(string entityName, string entityId, CancellationToken cancellationToken)
    {
        return await _context.AuditLogs
            .Where(x => x.EntityName == entityName && x.EntityId == entityId)
            .OrderByDescending(x => x.Timestamp)
            .Select(x => new AuditLogDto
            {
                Id = x.Id,
                UserId = x.UserId,
                UserEmail = x.UserEmail,
                Action = x.Action,
                EntityName = x.EntityName,
                EntityId = x.EntityId,
                OldValues = x.OldValues,
                NewValues = x.NewValues,
                IpAddress = x.IpAddress,
                UserAgent = x.UserAgent,
                Timestamp = x.Timestamp
            })
            .ToListAsync(cancellationToken);
    }
}
