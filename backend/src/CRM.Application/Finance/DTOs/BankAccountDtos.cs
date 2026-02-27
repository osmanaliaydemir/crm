namespace CRM.Application.Finance.DTOs;

public class BankAccountDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public decimal Balance { get; set; }
}

public class CreateBankAccountDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Detail { get; set; } = string.Empty;
    public decimal InitialBalance { get; set; }
}
