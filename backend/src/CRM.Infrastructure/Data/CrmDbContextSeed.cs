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

        var globalCustomer1 = Guid.NewGuid();
        var globalCustomer2 = Guid.NewGuid();
        var project1Guid = Guid.NewGuid();
        var product1Guid = Guid.NewGuid();

        // 1. Önce Müşterileri oluştur (Çünkü kullanıcılar müşterilere referans veriyor)
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

        // 2. Sonra Kullanıcıları oluştur (CustomerId referansı için müşteriler hazır olmalı)
        var hrUserGuid = Guid.NewGuid();
        var salesUserGuid = Guid.NewGuid();
        var financeUserGuid = Guid.NewGuid();
        var employeeUserGuid = Guid.NewGuid();
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

        if (!await context.Users.AnyAsync(u => u.Email == "customer@techcorp.com"))
        {
            var customerUser = new User { Id = Guid.NewGuid(), Name = "Ahmet Müşteri", Email = "customer@techcorp.com", Role = "customer", CustomerId = globalCustomer1, PasswordHash = HashPassword("User123!"), CreatedAt = DateTime.UtcNow, CreatedBy = "Seed" };
            context.Users.Add(customerUser);
        }

        await context.SaveChangesAsync();
        
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

        if (!context.PipelineDeals.Any())
        {
            var d1 = new PipelineDeal
            {
                Title = "Mobil Uygulama Geliştirme Paketi",
                Description = "Yeni startup müşterisi için iOS/Android native paket.",
                Stage = CRM.Domain.Enums.DealStage.Lead,
                Value = 120000,
                Probability = 20,
                CustomerId = globalCustomer2,
                AssignedToId = salesUserGuid,
                ExpectedCloseDate = DateTime.UtcNow.AddMonths(2),
                SortOrder = 0,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            var d2 = new PipelineDeal
            {
                Title = "CRM Özelleştirme Projesi",
                Description = "TechCorp için özel raporlama modülleri.",
                Stage = CRM.Domain.Enums.DealStage.Proposal,
                Value = 45000,
                Probability = 60,
                CustomerId = globalCustomer1,
                AssignedToId = salesUserGuid,
                ExpectedCloseDate = DateTime.UtcNow.AddDays(15),
                SortOrder = 0,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            var d3 = new PipelineDeal
            {
                Title = "Yıllık Bakım Anlaşması",
                Description = "Tüm sunucu ve veritabanı bakımı.",
                Stage = CRM.Domain.Enums.DealStage.Won,
                Value = 75000,
                Probability = 100,
                CustomerId = globalCustomer1,
                AssignedToId = salesUserGuid,
                ExpectedCloseDate = DateTime.UtcNow.AddDays(-5),
                SortOrder = 0,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seed"
            };

            context.PipelineDeals.AddRange(d1, d2, d3);
            await context.SaveChangesAsync();
        }

        if (!context.Notifications.Any())
        {
            var n1 = new Notification
            {
                UserId = adminGuid,
                Type = CRM.Domain.Enums.NotificationType.Finance,
                Title = "Ödeme Alındı",
                Description = "TechCorp Bilişim A.Ş. tarafından 50.000 TL ödeme yapıldı.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                CreatedBy = "Seed"
            };

            var n2 = new Notification
            {
                UserId = adminGuid,
                Type = CRM.Domain.Enums.NotificationType.Calendar,
                Title = "Toplantı Hatırlatıcı",
                Description = "1 saat sonra 'CRM Standup' toplantısı başlayacak.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow.AddMinutes(-30),
                CreatedBy = "Seed"
            };

            var n3 = new Notification
            {
                UserId = adminGuid,
                Type = CRM.Domain.Enums.NotificationType.System,
                Title = "Sistem Güncellemesi",
                Description = "Backend API v1.2 sürümüne başarıyla güncellendi.",
                IsRead = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                CreatedBy = "Seed"
            };

            context.Notifications.AddRange(n1, n2, n3);
            await context.SaveChangesAsync();
        }

        if (!context.Announcements.Any())
        {
            var a1 = new Announcement
            {
                Title = "Ramazan Bayramı Tatili Hakkında",
                Content = "Ramazan Bayramı dolayısıyla 30 Mart - 1 Nisan tarihleri arasında ofisimiz kapalı olacaktır. Tüm çalışanlarımıza iyi bayramlar dileriz.",
                Type = "Genel",
                IsActive = true,
                PublishedById = adminGuid,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                CreatedBy = "Seed"
            };

            var a2 = new Announcement
            {
                Title = "2026 Yılı Genel Kurulu",
                Content = "Şirketimizin 2026 yılı Olağan Genel Kurul toplantısı 15 Nisan tarihinde saat 14:00'te Zoom üzerinden yapılacaktır.",
                Type = "İdari",
                IsActive = true,
                PublishedById = adminGuid,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                CreatedBy = "Seed"
            };

            context.Announcements.AddRange(a1, a2);
            await context.SaveChangesAsync();
        }

        if (!context.SystemSettings.Any())
        {
            context.SystemSettings.AddRange(
                new SystemSetting { Id = Guid.NewGuid(), Key = "Security_2FA_Enabled", Value = "false", Category = "Security", Description = "İki Aşamalı Doğrulama (2FA) durumu" },
                new SystemSetting { Id = Guid.NewGuid(), Key = "Security_StrongPassword_Required", Value = "true", Category = "Security", Description = "Güçlü şifre politikası" },
                new SystemSetting { Id = Guid.NewGuid(), Key = "Security_SessionTimeout_Minutes", Value = "30", Category = "Security", Description = "Oturum zaman aşımı süresi" },
                new SystemSetting { Id = Guid.NewGuid(), Key = "Notify_NewLead_Email", Value = "true", Category = "Notification", Description = "Yeni müşteri kayıt bildirimi" },
                new SystemSetting { Id = Guid.NewGuid(), Key = "Notify_WonDeal_Management", Value = "true", Category = "Notification", Description = "Kazanılan fırsat bildirimi" },
                new SystemSetting { Id = Guid.NewGuid(), Key = "Appearance_ThemeMode", Value = "system", Category = "Appearance", Description = "Sistem tema modu" },
                new SystemSetting { Id = Guid.NewGuid(), Key = "Appearance_PrimaryColor", Value = "blue", Category = "Appearance", Description = "Kurumsal ana renk" }
            );
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
