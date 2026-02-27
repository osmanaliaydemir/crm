using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Expense : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string Category { get; set; } = string.Empty; // Konaklama, Seyahat, Yemek vb.
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Bekliyor"; // Bekliyor, Ödendi, Reddedildi
    public string? ReceiptPath { get; set; } // Fiş veya fatura dosya yolu
    
    public Guid? ApprovedById { get; set; }
    public User? ApprovedBy { get; set; }
}
