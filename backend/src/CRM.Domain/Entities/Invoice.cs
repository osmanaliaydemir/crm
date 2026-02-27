using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Invoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    
    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; } // Örn: 18, 20
    public decimal TaxAmount { get; set; }
    public decimal TotalAmount { get; set; }
    
    public string Status { get; set; } = "Taslak"; // Taslak, Gönderildi, Ödendi
    public string? Notes { get; set; }
    
    public ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
}
