using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty; // Stok Kodu
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int MinimumStockLevel { get; set; }
    public string Status { get; set; } = "Aktif"; // Aktif, Pasif, Tükendi
    
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}
