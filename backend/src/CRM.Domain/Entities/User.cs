using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "employee"; // admin, sales, hr, finance, support, employee, customer
    public string? Avatar { get; set; }
    
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
}
