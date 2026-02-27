using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Customer : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "B2B"; // B2B, B2C
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Status { get; set; } = "Aktif";
    public int HealthScore { get; set; } = 100;
    
    // Navigation Properties
    public ICollection<Interaction> Interactions { get; set; } = new List<Interaction>();
    public ICollection<CustomerFile> Files { get; set; } = new List<CustomerFile>();
}
