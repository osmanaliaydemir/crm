using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class ProjectTask : BaseEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public string Status { get; set; } = "To Do"; // To Do, In Progress, In Review, Done
    public string Priority { get; set; } = "Normal"; // Düşük, Normal, Yüksek, Acil
    
    public DateTime? DueDate { get; set; }
    
    // Görevi üstlenen personel
    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
}
