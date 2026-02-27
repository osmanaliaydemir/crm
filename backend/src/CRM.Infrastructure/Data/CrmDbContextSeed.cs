using CRM.Domain.Entities;
using CRM.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRM.Infrastructure.Data;

public static class CrmDbContextSeed
{
    public static async Task SeedAsync(CrmDbContext context)
    {
        // Add basic migration execution first (Program.cs should normally do this, but just in case)
        await context.Database.MigrateAsync();

        var hrUserGuid = Guid.NewGuid();
        var salesUserGuid = Guid.NewGuid();
        var financeUserGuid = Guid.NewGuid();
        var employeeUserGuid = Guid.NewGuid();
        var globalCustomer1 = Guid.NewGuid();
        var globalCustomer2 = Guid.NewGuid();
        var project1Guid = Guid.NewGuid();
        var product1Guid = Guid.NewGuid();

        var adminGuid = Guid.NewGuid();
        if (!await context.Users.AnyAsync(u => u.Email == "admin@crm.com"))
        {
            var adminUser = new User { Id = adminGuid, Email = "admin@crm.com", Role = "admin", PasswordHash = HashPassword("Admin123!"), CreatedAt = DateTime.UtcNow, CreatedBy = "Seed" };
            context.Users.Add(adminUser);
        }
        else { adminGuid = await context.Users.Where(u => u.Email == "admin@crm.com").Select(u => u.Id).FirstOrDefaultAsync(); }

        if (!await context.Users.AnyAsync(u => u.Email == "hr@crm.com"))
        {
            var hrUser = new User { Id = hrUserGuid, Email = "hr@crm.com", Role = "hr", PasswordHash = HashPassword("User123!"), CreatedAt = DateTime.UtcNow, CreatedBy = "Seed" };
            context.Users.Add(hrUser);
        }
        else { hrUserGuid = await context.Users.Where(u => u.Email == "hr@crm.com").Select(u => u.Id).FirstOrDefaultAsync(); }

        if (!await context.Users.AnyAsync(u => u.Email == "sales@crm.com"))
        {
            var salesUser = new User { Id = salesUserGuid, Email = "sales@crm.com", Role = "sales", PasswordHash = HashPassword("User123!"), CreatedAt = DateTime.UtcNow, CreatedBy = "Seed" };
            context.Users.Add(salesUser);
        }
        else { salesUserGuid = await context.Users.Where(u => u.Email == "sales@crm.com").Select(u => u.Id).FirstOrDefaultAsync(); }

        if (!await context.Users.AnyAsync(u => u.Email == "finance@crm.com"))
        {
            var financeUser = new User { Id = financeUserGuid, Email = "finance@crm.com", Role = "finance", PasswordHash = HashPassword("User123!"), CreatedAt = DateTime.UtcNow, CreatedBy = "Seed" };
            context.Users.Add(financeUser);
        }
        else { financeUserGuid = await context.Users.Where(u => u.Email == "finance@crm.com").Select(u => u.Id).FirstOrDefaultAsync(); }

        if (!await context.Users.AnyAsync(u => u.Email == "employee@crm.com"))
        {
            var employeeUser = new User { Id = employeeUserGuid, Email = "employee@crm.com", Role = "employee", PasswordHash = HashPassword("User123!"), CreatedAt = DateTime.UtcNow, CreatedBy = "Seed" };
            context.Users.Add(employeeUser);
        }
        else { employeeUserGuid = await context.Users.Where(u => u.Email == "employee@crm.com").Select(u => u.Id).FirstOrDefaultAsync(); }
        
        await context.SaveChangesAsync();

        if (!context.Customers.Any())
        {
            var c1 = new Customer
            {
                Id = globalCustomer1,
                Type = "Kurumsal",
                Name = "TechCorp Bilişim A.Ş.",
                ContactName = "Ahmet Yılmaz",
                Email = "ahmet@techcorp.com",
                Phone = "+90 532 111 22 33",
                Status = "Aktif",
                City = "İstanbul",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            var c2 = new Customer
            {
                Id = globalCustomer2,
                Type = "Bireysel",
                ContactName = "Zeynep Demir",
                Email = "zeynep@hotmail.com",
                Phone = "+90 533 444 55 66",
                Status = "Aktif",
                City = "Ankara",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };
            
            context.Customers.AddRange(c1, c2);
            await context.SaveChangesAsync();
        }
        else
        {
            var custs = await context.Customers.Take(2).ToListAsync();
            if (custs.Any())
            {
                globalCustomer1 = custs[0].Id;
                if(custs.Count > 1) globalCustomer2 = custs[1].Id;
            }
        }
        
        if (!context.Products.Any())
        {
            var p1 = new Product
            {
                Id = product1Guid,
                Name = "ERP Lisans Yıllık",
                SKU = "SW-ERP-001",
                Category = "Yazılım",
                Price = 50000,
                StockQuantity = 999,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            var p2 = new Product
            {
                Name = "Sunucu Bakım Paketi",
                SKU = "SRV-MNT-12",
                Category = "Hizmet",
                Price = 15000,
                StockQuantity = 50,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            context.Products.AddRange(p1, p2);
            await context.SaveChangesAsync();
        }
        else
        {
             var prods = await context.Products.FirstOrDefaultAsync();
             if(prods != null) product1Guid = prods.Id;
        }

        if (!context.Orders.Any())
        {
            var orderId = Guid.NewGuid();
            var o1 = new Order
            {
                Id = orderId,
                OrderNumber = "ORD-2026-001",
                CustomerId = globalCustomer1,
                Status = "OnayBekliyor",
                OrderDate = DateTime.UtcNow,
                TotalAmount = 50000,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed",
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        ProductId = product1Guid,
                        Quantity = 1,
                        UnitPrice = 50000,
                        TotalPrice = 50000,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "Seed"
                    }
                }
            };
            context.Orders.Add(o1);
            await context.SaveChangesAsync();
        }

        if (!context.Projects.Any())
        {
            var p1 = new Project
            {
                Id = project1Guid,
                Name = "E-Ticaret Altyapı Yenileme",
                Description = "Müşteri e-ticaret portalının Next.js ile baştan yazılması.",
                Status = "Devam Ediyor",
                StartDate = DateTime.UtcNow.AddDays(-10),
                EndDate = DateTime.UtcNow.AddDays(30),
                CustomerId = globalCustomer1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };
            
            p1.Tasks.Add(new ProjectTask
            {
                Title = "Tasarım Onayı",
                Description = "Müşteriden Figma üzerinden onay alınacak",
                Status = "Tamamlandı",
                Priority = "Orta",
                AssignedToId = salesUserGuid,
                DueDate = DateTime.UtcNow.AddDays(-5),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            });
            
            p1.Tasks.Add(new ProjectTask
            {
                Title = "Backend API Geliştirme",
                Description = "Katalog ve sepet mikroservisleri",
                Status = "Devam Ediyor",
                Priority = "Yüksek",
                AssignedToId = hrUserGuid, // Örnek olarak hr user atandı
                DueDate = DateTime.UtcNow.AddDays(10),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            });

            context.Projects.Add(p1);
            await context.SaveChangesAsync();
        }

        if (!context.LeaveRequests.Any())
        {
            var lr1 = new LeaveRequest
            {
                UserId = hrUserGuid,
                Type = "Yıllık İzin",
                StartDate = DateTime.UtcNow.AddDays(15),
                EndDate = DateTime.UtcNow.AddDays(20),
                Reason = "Yaz tatili",
                Status = "Onaylandı",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed",
                ApprovedById = hrUserGuid // Admin approved but for sake of simplicity
            };

            var lr2 = new LeaveRequest
            {
                UserId = salesUserGuid,
                Type = "Mazeret İzni",
                StartDate = DateTime.UtcNow.AddDays(2),
                EndDate = DateTime.UtcNow.AddDays(3),
                Reason = "Taşınma işlemleri",
                Status = "Bekliyor",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };
            
            context.LeaveRequests.AddRange(lr1, lr2);
            await context.SaveChangesAsync();
        }
        
        if (!context.Expenses.Any())
        {
            var e1 = new Expense
            {
                UserId = salesUserGuid,
                Category = "Yol / Ulaşım",
                Amount = 1450.50m,
                Date = DateTime.UtcNow.AddDays(-2),
                Description = "Ankara müşteri ziyareti uçak bileti",
                Status = "Bekliyor",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };
            
            var e2 = new Expense
            {
                UserId = hrUserGuid,
                Category = "Yazılım / Servis",
                Amount = 500m,
                Date = DateTime.UtcNow.AddDays(-10),
                Description = "Aylık Adobe lisans ücreti",
                Status = "Ödendi",
                ApprovedById = salesUserGuid,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            context.Expenses.AddRange(e1, e2);
            await context.SaveChangesAsync();
        }
        
        if (!context.Events.Any())
        {
            var ev1 = new Event
            {
                Title = "TechCorp ERP Sunumu",
                Description = "ERP modüllerinin son kontrolleri ve demo",
                StartDate = DateTime.UtcNow.AddDays(2),
                EndDate = DateTime.UtcNow.AddDays(2).AddHours(1),
                Type = "Proje",
                Location = "Online (Teams)",
                UserId = salesUserGuid,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            context.Events.Add(ev1);
            await context.SaveChangesAsync();
        }

        if (!context.Tickets.Any())
        {
            var t1 = new Ticket
            {
                Subject = "Sisteme giriş yapamıyorum",
                Description = "Şifremi sıfırladım ancak hala hatalı şifre uyarısı alıyorum.",
                Status = "Açık",
                Priority = "Yüksek",
                CustomerId = globalCustomer2,
                AssignedToId = hrUserGuid,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };
            
            t1.Comments.Add(new TicketComment
            {
                Content = "Parolanızı geçici olarak 123456 yaptık, lütfen deneyin.",
                UserId = hrUserGuid,
                CreatedAt = DateTime.UtcNow.AddHours(-1),
                CreatedBy = "Seed"
            });

            context.Tickets.Add(t1);
            await context.SaveChangesAsync();
        }
    }

    private static string HashPassword(string password)
    {
        using var sha256 = System.Security.Cryptography.SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
