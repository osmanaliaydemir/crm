using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Ticket : BaseEntity
{
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    
    public string Priority { get; set; } = "Normal"; // Düşük, Normal, Yüksek, Acil
    public string Status { get; set; } = "Açık"; // Açık, İncelemede, Beklemede, Çözüldü, Kapalı
    
    // Bilet bir müşteriye mi yoksa iç personele mi ait olabilir. Şimdilik Müşteri odaklı yapalım ama Opsiyonel bırakıyoruz.
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    
    // Bileti açan kullanıcı (Sistem kullanıcısı ise)
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    // Bilet ile ilgilenen destek personeli
    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    
    public ICollection<TicketComment> Comments { get; set; } = new List<TicketComment>();
}
