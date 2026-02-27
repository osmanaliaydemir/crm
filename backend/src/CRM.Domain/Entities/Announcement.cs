using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Announcement : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = "Genel"; // Genel, Finans, İdari, Acil
    public bool IsActive { get; set; } = true;
    
    public Guid PublishedById { get; set; }
    public User PublishedBy { get; set; } = null!;
}
