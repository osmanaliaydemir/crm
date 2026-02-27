using CRM.Application.Calendar.DTOs;

namespace CRM.Application.Calendar.Interfaces;

public interface IEventService
{
    Task<IEnumerable<EventDto>> GetAllByUserAsync(Guid userId, DateTime? start, DateTime? end, CancellationToken cancellationToken);
    Task<EventDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<EventDto> CreateAsync(CreateEventDto dto, Guid userId, CancellationToken cancellationToken);
    Task<EventDto?> UpdateAsync(UpdateEventDto dto, Guid userId, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken);
    
    Task<EventAttendeeDto?> AddAttendeeAsync(AddAttendeeDto dto, Guid currentUserId, CancellationToken cancellationToken);
    Task<EventAttendeeDto?> UpdateAttendeeStatusAsync(UpdateAttendeeStatusDto dto, Guid currentUserId, CancellationToken cancellationToken);
    Task<bool> RemoveAttendeeAsync(Guid attendeeId, Guid currentUserId, CancellationToken cancellationToken);
}
