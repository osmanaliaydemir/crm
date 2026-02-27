using CRM.Application.Common.Interfaces;
using CRM.Application.Notifications.DTOs;
using CRM.Application.Notifications.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Notifications.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;

    public NotificationService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type,
                Title = n.Title,
                Description = n.Description,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ActionUrl = n.ActionUrl
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);
    }

    public async Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications.FindAsync(new object[] { id }, cancellationToken);
        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken)
    {
        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var n in unreadNotifications)
        {
            n.IsRead = true;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> CreateNotificationAsync(CreateNotificationDto dto, CancellationToken cancellationToken)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = dto.UserId,
            Type = dto.Type,
            Title = dto.Title,
            Description = dto.Description,
            IsRead = false,
            ActionUrl = dto.ActionUrl,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteNotificationAsync(Guid id, CancellationToken cancellationToken)
    {
        var notification = await _context.Notifications.FindAsync(new object[] { id }, cancellationToken);
        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
