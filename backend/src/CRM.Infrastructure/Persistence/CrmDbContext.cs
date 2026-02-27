using System.Reflection;
using System.Text.Json;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Common;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace CRM.Infrastructure.Persistence;

public class CrmDbContext : DbContext, IApplicationDbContext
{
    private readonly ICurrentUserService _currentUserService;

    public CrmDbContext(
        DbContextOptions<CrmDbContext> options,
        ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Interaction> Interactions => Set<Interaction>();
    public DbSet<CustomerFile> CustomerFiles => Set<CustomerFile>();
    public DbSet<PipelineDeal> PipelineDeals => Set<PipelineDeal>();
    
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
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Global Query Filter for Soft Delete
        builder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        builder.Entity<Customer>().HasQueryFilter(c => !c.IsDeleted);
        builder.Entity<Interaction>().HasQueryFilter(i => !i.IsDeleted);
        builder.Entity<CustomerFile>().HasQueryFilter(cf => !cf.IsDeleted);
        builder.Entity<PipelineDeal>().HasQueryFilter(pd => !pd.IsDeleted);
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
        builder.Entity<Notification>().HasQueryFilter(n => !n.IsDeleted);
        builder.Entity<Announcement>().HasQueryFilter(a => !a.IsDeleted);
        // AuditLog entities are not soft-deleted, so no query filter is applied.

        // Soft delete kullandığımız için, veritabanı seviyesindeki tüm Cascade silme kurallarını iptal edip Restrict/NoAction yapıyoruz
        // Bu sayede SQL Server "multiple cascade paths" hatasının önüne geçmiş olacağız.
        foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        // Decimal Precision configurations to avoid SQL Server warnings
        foreach (var property in builder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }

        base.OnModelCreating(builder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId?.ToString() ?? "System";
        
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.CreatedBy = userId; 
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = userId;
                    break;
                case EntityState.Deleted:
                    // Soft delete logic
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = userId;
                    break;
            }
        }

        // Capture Audit Logs
        OnBeforeSaveChanges();

        return await base.SaveChangesAsync(cancellationToken);
    }

    private void OnBeforeSaveChanges()
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditLog>();

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditLog
            {
                Id = Guid.NewGuid(),
                UserId = _currentUserService.UserId,
                UserEmail = _currentUserService.UserEmail ?? "System",
                EntityName = entry.Entity.GetType().Name,
                Timestamp = DateTime.UtcNow,
                Action = entry.State.ToString()
            };

            var oldValues = new Dictionary<string, object?>();
            var newValues = new Dictionary<string, object?>();

            foreach (var property in entry.Properties)
            {
                string propertyName = property.Metadata.Name;

                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.EntityId = property.CurrentValue?.ToString() ?? string.Empty;
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        newValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        oldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            oldValues[propertyName] = property.OriginalValue;
                            newValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }

            auditEntry.OldValues = oldValues.Count == 0 ? null : JsonSerializer.Serialize(oldValues);
            auditEntry.NewValues = newValues.Count == 0 ? null : JsonSerializer.Serialize(newValues);
            
            auditEntries.Add(auditEntry);
        }

        foreach (var auditEntry in auditEntries)
        {
            AuditLogs.Add(auditEntry);
        }
    }
}
