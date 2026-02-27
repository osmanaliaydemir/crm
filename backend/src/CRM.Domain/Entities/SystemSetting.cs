using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class SystemSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = "General"; // Security, Notification, Appearance, etc.
    public string Description { get; set; } = string.Empty;
}
