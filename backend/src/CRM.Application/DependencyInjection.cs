using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CRM.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        services.AddScoped<CRM.Application.Customers.Interfaces.ICustomerService, CRM.Application.Customers.Services.CustomerService>();
        services.AddScoped<CRM.Application.Pipeline.Interfaces.IPipelineService, CRM.Application.Pipeline.Services.PipelineService>();
        
        services.AddScoped<CRM.Application.Finance.Interfaces.IBankAccountService, CRM.Application.Finance.Services.BankAccountService>();
        services.AddScoped<CRM.Application.Finance.Interfaces.ITransactionService, CRM.Application.Finance.Services.TransactionService>();
        services.AddScoped<CRM.Application.Finance.Interfaces.IInvoiceService, CRM.Application.Finance.Services.InvoiceService>();
        
        services.AddScoped<CRM.Application.Inventory.Interfaces.IProductService, CRM.Application.Inventory.Services.ProductService>();
        services.AddScoped<CRM.Application.Inventory.Interfaces.IStockMovementService, CRM.Application.Inventory.Services.StockMovementService>();
        
        services.AddScoped<CRM.Application.Orders.Interfaces.IOrderService, CRM.Application.Orders.Services.OrderService>();

        services.AddScoped<CRM.Application.HR.Interfaces.ILeaveRequestService, CRM.Application.HR.Services.LeaveRequestService>();
        services.AddScoped<CRM.Application.HR.Interfaces.IExpenseService, CRM.Application.HR.Services.ExpenseService>();
        services.AddScoped<CRM.Application.HR.Interfaces.IPerformanceService, CRM.Application.HR.Services.PerformanceService>();
        services.AddScoped<CRM.Application.HR.Interfaces.IPayrollService, CRM.Application.HR.Services.PayrollService>();

        services.AddScoped<CRM.Application.Helpdesk.Interfaces.ITicketService, CRM.Application.Helpdesk.Services.TicketService>();

        services.AddScoped<CRM.Application.Projects.Interfaces.IProjectService, CRM.Application.Projects.Services.ProjectService>();

        services.AddScoped<CRM.Application.Calendar.Interfaces.IEventService, CRM.Application.Calendar.Services.EventService>();

        services.AddScoped<CRM.Application.Documents.Interfaces.IDocumentService, CRM.Application.Documents.Services.DocumentService>();

        services.AddScoped<CRM.Application.Notifications.Interfaces.INotificationService, CRM.Application.Notifications.Services.NotificationService>();
        services.AddScoped<CRM.Application.Announcements.Interfaces.IAnnouncementService, CRM.Application.Announcements.Services.AnnouncementService>();
        services.AddScoped<CRM.Application.Reports.Interfaces.IReportingService, CRM.Application.Reports.Services.ReportingService>();
        services.AddScoped<CRM.Application.AuditLogs.Interfaces.IAuditLogService, CRM.Application.AuditLogs.Services.AuditLogService>();

        return services;
    }
}
