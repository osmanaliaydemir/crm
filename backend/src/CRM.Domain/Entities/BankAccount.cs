using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class BankAccount : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Bank, Cash, Credit
    public string Detail { get; set; } = string.Empty; // IBAN, Hesap No vb.
    public decimal Balance { get; set; }
    
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
