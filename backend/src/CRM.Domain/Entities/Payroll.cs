using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Payroll : BaseEntity
{
    public Guid EmployeeId { get; set; }
    public User Employee { get; set; } = null!;
    
    public string Period { get; set; } = string.Empty; // Örn: "2024-03", "Nisan 2024"
    public decimal BasicSalary { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetSalary { get; set; }
    
    public string Status { get; set; } = "Taslak"; // Taslak, Ödendi
    public DateTime? PaymentDate { get; set; }
}
