using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Interaction> Interactions { get; }
    DbSet<CustomerFile> CustomerFiles { get; }
    
    DbSet<Transaction> Transactions { get; }
    DbSet<BankAccount> BankAccounts { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoiceItem> InvoiceItems { get; }
    
    DbSet<Product> Products { get; }
    DbSet<StockMovement> StockMovements { get; }
    
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }

    DbSet<LeaveRequest> LeaveRequests { get; }
    DbSet<Expense> Expenses { get; }
    DbSet<PerformanceEvaluation> PerformanceEvaluations { get; }
    DbSet<Payroll> Payrolls { get; }

    DbSet<Ticket> Tickets { get; }
    DbSet<TicketComment> TicketComments { get; }

    DbSet<Project> Projects { get; }
    DbSet<ProjectTask> ProjectTasks { get; }

    DbSet<Event> Events { get; }
    DbSet<EventAttendee> EventAttendees { get; }

    DbSet<Document> Documents { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
