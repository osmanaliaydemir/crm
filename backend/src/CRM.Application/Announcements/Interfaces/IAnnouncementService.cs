using CRM.Application.Announcements.DTOs;

namespace CRM.Application.Announcements.Interfaces;

public interface IAnnouncementService
{
    Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync(CancellationToken cancellationToken);
    Task<List<AnnouncementDto>> GetAllAnnouncementsAsync(CancellationToken cancellationToken);
    Task<AnnouncementDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<AnnouncementDto> CreateAsync(CreateAnnouncementDto dto, Guid userId, CancellationToken cancellationToken);
    Task<bool> UpdateAsync(UpdateAnnouncementDto dto, CancellationToken cancellationToken);
    Task<bool> ToggleStatusAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
