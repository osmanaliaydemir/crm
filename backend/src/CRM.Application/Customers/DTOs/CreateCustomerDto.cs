namespace CRM.Application.Customers.DTOs;

public class CreateCustomerDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "B2B";
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Status { get; set; } = "Aktif";
    public int HealthScore { get; set; } = 100;
}
