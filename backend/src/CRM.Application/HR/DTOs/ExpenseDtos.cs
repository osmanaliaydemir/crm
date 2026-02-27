namespace CRM.Application.HR.DTOs;

public class ExpenseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ReceiptPath { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateExpenseDto
{
    public Guid UserId { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    // Note: Fiş/Fatura gönderimi API üzerinden Multipart/form-data ile yönetilecek
}

public class UpdateExpenseStatusDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty; // Ödendi, Reddedildi
    public Guid ApprovedById { get; set; }
}
