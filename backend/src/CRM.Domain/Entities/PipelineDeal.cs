using CRM.Domain.Common;
using CRM.Domain.Enums;

namespace CRM.Domain.Entities;

public class PipelineDeal : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public DealStage Stage { get; set; } = DealStage.Lead;
    public decimal Value { get; set; }
    public int Probability { get; set; } // 0-100 arası kazanma olasılığı
    
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    
    public DateTime? ExpectedCloseDate { get; set; }
    public int SortOrder { get; set; } // Kanban tahtasındaki sıralama
}
