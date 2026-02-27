using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Interaction : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public string Type { get; set; } = string.Empty; // Telefon, E-posta, Toplantı
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}
