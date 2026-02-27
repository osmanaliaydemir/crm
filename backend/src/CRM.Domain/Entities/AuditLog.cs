namespace CRM.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty; // Create, Update, Delete
    public string EntityName { get; set; } = string.Empty; // Customer, Order, etc.
    public string EntityId { get; set; } = string.Empty;
    
    public string? OldValues { get; set; } // JSON format
    public string? NewValues { get; set; } // JSON format
    
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; }
}
