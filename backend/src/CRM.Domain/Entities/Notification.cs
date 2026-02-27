using CRM.Domain.Common;
using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    
    public string? ActionUrl { get; set; } // Bildirime tıklandığında gidilecek URL
    public string? MetaData { get; set; } // Ek json bilgisi gerekirse
}
