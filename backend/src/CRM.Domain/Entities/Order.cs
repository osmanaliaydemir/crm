using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Order : BaseEntity
{
    public string OrderNumber { get; set; } = string.Empty;
    
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = "Yeni"; // Yeni, Hazırlanıyor, Kargolandı, Teslim Edildi, İptal
    
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
