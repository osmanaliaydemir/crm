using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    
    public string Status { get; set; } = "Planlanıyor"; // Planlanıyor, Aktif, Beklemede, Tamamlandı, İptal
    
    // Proje, belirli bir müşteri için yapılıyor olabilir (opsiyonel)
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    
    public ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
}
