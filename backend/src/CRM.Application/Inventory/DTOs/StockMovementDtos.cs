namespace CRM.Application.Inventory.DTOs;

public class StockMovementDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}

public class CreateStockMovementDto
{
    public Guid ProductId { get; set; }
    public string Type { get; set; } = string.Empty; // Giriş, Çıkış, İade vb.
    public int Quantity { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}
