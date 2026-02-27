using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Transaction : BaseEntity
{
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // in, out
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty; // Tamamlandı, Bekliyor, İptal Edildi
    
    public Guid? AccountId { get; set; }
    public BankAccount? Account { get; set; }
}
