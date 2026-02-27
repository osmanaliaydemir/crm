using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class StockMovement : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
    
    public string Type { get; set; } = string.Empty; // Giriş, Çıkış, İade
    public int Quantity { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}
