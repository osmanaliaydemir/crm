using System.Reflection;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Common;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Persistence;

public class CrmDbContext : DbContext, IApplicationDbContext
{
    public CrmDbContext(DbContextOptions<CrmDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Interaction> Interactions => Set<Interaction>();
    public DbSet<CustomerFile> CustomerFiles => Set<CustomerFile>();
    
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    
    public DbSet<Product> Products => Set<Product>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<PerformanceEvaluation> PerformanceEvaluations => Set<PerformanceEvaluation>();
    public DbSet<Payroll> Payrolls => Set<Payroll>();

    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<TicketComment> TicketComments => Set<TicketComment>();

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectTask> ProjectTasks => Set<ProjectTask>();

    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventAttendee> EventAttendees => Set<EventAttendee>();

    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global Query Filter for Soft Delete
        builder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        builder.Entity<Customer>().HasQueryFilter(c => !c.IsDeleted);
        builder.Entity<Interaction>().HasQueryFilter(i => !i.IsDeleted);
        builder.Entity<CustomerFile>().HasQueryFilter(cf => !cf.IsDeleted);
        builder.Entity<Transaction>().HasQueryFilter(t => !t.IsDeleted);
        builder.Entity<BankAccount>().HasQueryFilter(ba => !ba.IsDeleted);
        builder.Entity<Invoice>().HasQueryFilter(i => !i.IsDeleted);
        builder.Entity<InvoiceItem>().HasQueryFilter(ii => !ii.IsDeleted);
        builder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
        builder.Entity<StockMovement>().HasQueryFilter(sm => !sm.IsDeleted);
        builder.Entity<Order>().HasQueryFilter(o => !o.IsDeleted);
        builder.Entity<OrderItem>().HasQueryFilter(oi => !oi.IsDeleted);
        
        builder.Entity<LeaveRequest>().HasQueryFilter(lr => !lr.IsDeleted);
        builder.Entity<Expense>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<PerformanceEvaluation>().HasQueryFilter(pe => !pe.IsDeleted);
        builder.Entity<Payroll>().HasQueryFilter(p => !p.IsDeleted);
        
        builder.Entity<Ticket>().HasQueryFilter(t => !t.IsDeleted);
        builder.Entity<TicketComment>().HasQueryFilter(tc => !tc.IsDeleted);
        
        builder.Entity<Project>().HasQueryFilter(p => !p.IsDeleted);
        builder.Entity<ProjectTask>().HasQueryFilter(pt => !pt.IsDeleted);

        builder.Entity<Event>().HasQueryFilter(e => !e.IsDeleted);
        builder.Entity<EventAttendee>().HasQueryFilter(ea => !ea.IsDeleted);

        builder.Entity<Document>().HasQueryFilter(d => !d.IsDeleted);

        // Soft delete kullandığımız için, veritabanı seviyesindeki tüm Cascade silme kurallarını iptal edip Restrict/NoAction yapıyoruz
        // Bu sayede SQL Server "multiple cascade paths" hatasının önüne geçmiş olacağız.
        foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        base.OnModelCreating(builder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    // TODO: Get Current User Id
                    entry.Entity.CreatedBy = "System"; 
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    // TODO: Get Current User Id
                    entry.Entity.UpdatedBy = "System";
                    break;
                case EntityState.Deleted:
                    // Soft delete logic
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = "System";
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
