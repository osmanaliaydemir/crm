namespace CRM.Application.Portal.DTOs;

public class PortalSummaryDto
{
    public decimal TotalOrderAmount { get; set; }
    public decimal TotalInvoiceAmount { get; set; }
    public decimal PendingPaymentAmount { get; set; }
    public decimal OutstandingBalance { get; set; }
}

public class PortalOrderDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class PortalInvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime DueDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
