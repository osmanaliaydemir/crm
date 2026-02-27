using CRM.Application.Notifications.DTOs;

namespace CRM.Application.Notifications.Interfaces;

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, CancellationToken cancellationToken);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken);
    Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken);
    Task<bool> CreateNotificationAsync(CreateNotificationDto dto, CancellationToken cancellationToken);
    Task<bool> DeleteNotificationAsync(Guid id, CancellationToken cancellationToken);
}
