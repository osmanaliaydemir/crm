namespace CRM.Application.Finance.DTOs;

public class TransactionDto
{
    public Guid Id { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? AccountId { get; set; }
}

public class CreateTransactionDto
{
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // in, out
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "Tamamlandı";
    public Guid? AccountId { get; set; }
}

public class UpdateTransactionStatusDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}
