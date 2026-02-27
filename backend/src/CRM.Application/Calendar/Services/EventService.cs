using CRM.Application.Calendar.DTOs;
using CRM.Application.Calendar.Interfaces;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Calendar.Services;

public class EventService : IEventService
{
    private readonly IApplicationDbContext _context;

    public EventService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EventDto>> GetAllByUserAsync(Guid userId, DateTime? start, DateTime? end, CancellationToken cancellationToken)
    {
        var query = _context.Events
            .Include(e => e.User)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.User)
            .AsNoTracking()
            .Where(e => e.UserId == userId || e.Attendees.Any(a => a.UserId == userId));

        if (start.HasValue)
            query = query.Where(e => e.StartDate >= start.Value);
            
        if (end.HasValue)
            query = query.Where(e => e.EndDate <= end.Value);

        var events = await query.OrderBy(e => e.StartDate).ToListAsync(cancellationToken);

        return events.Select(MapToDto);
    }

    public async Task<EventDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var e = await _context.Events
            .Include(ev => ev.User)
            .Include(ev => ev.Attendees)
                .ThenInclude(a => a.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(ev => ev.Id == id, cancellationToken);

        if (e == null) return null;

        return MapToDto(e);
    }

    public async Task<EventDto> CreateAsync(CreateEventDto dto, Guid userId, CancellationToken cancellationToken)
    {
        var entity = new Event
        {
            Title = dto.Title,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Type = dto.Type,
            Location = dto.Location,
            UserId = userId
        };

        _context.Events.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        // Include user for mapping
        var created = await _context.Events
            .Include(e => e.User)
            .FirstAsync(e => e.Id == entity.Id, cancellationToken);

        return MapToDto(created);
    }

    public async Task<EventDto?> UpdateAsync(UpdateEventDto dto, Guid userId, CancellationToken cancellationToken)
    {
        var entity = await _context.Events
            .Include(e => e.User)
            .Include(e => e.Attendees)
                .ThenInclude(a => a.User)
            .FirstOrDefaultAsync(e => e.Id == dto.Id, cancellationToken);

        if (entity == null || entity.UserId != userId) return null; // Sadece oluşturan kişi güncelleyebilir

        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.StartDate = dto.StartDate;
        entity.EndDate = dto.EndDate;
        entity.Type = dto.Type;
        entity.Location = dto.Location;

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        var entity = await _context.Events.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null || entity.UserId != userId) return false; // Sadece sahibi silebilir

        _context.Events.Remove(entity); // Soft Delete
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<EventAttendeeDto?> AddAttendeeAsync(AddAttendeeDto dto, Guid currentUserId, CancellationToken cancellationToken)
    {
        var ev = await _context.Events.FindAsync(new object[] { dto.EventId }, cancellationToken);
        if (ev == null || ev.UserId != currentUserId) return null; // Sadece etkinlik sahibi katılımcı ekleyebilir

        // Zaten ekli mi diye kontrol
        var existing = await _context.EventAttendees
            .FirstOrDefaultAsync(a => a.EventId == dto.EventId && a.UserId == dto.UserId, cancellationToken);
            
        if (existing != null) return null;

        var entity = new EventAttendee
        {
            EventId = dto.EventId,
            UserId = dto.UserId,
            Status = "Bekliyor"
        };

        _context.EventAttendees.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var attendeeWithUser = await _context.EventAttendees
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == entity.Id, cancellationToken);

        return new EventAttendeeDto
        {
            Id = entity.Id,
            EventId = entity.EventId,
            UserId = entity.UserId,
            UserName = attendeeWithUser?.User?.Name ?? string.Empty,
            Status = entity.Status
        };
    }

    public async Task<EventAttendeeDto?> UpdateAttendeeStatusAsync(UpdateAttendeeStatusDto dto, Guid currentUserId, CancellationToken cancellationToken)
    {
        var entity = await _context.EventAttendees
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == dto.Id, cancellationToken);

        if (entity == null) return null;

        // İlgili kişi kendi durumunu güncelleyebilir veya etkinlik sahibi
        var ev = await _context.Events.FindAsync(new object[] { entity.EventId }, cancellationToken);
        if (entity.UserId != currentUserId && ev?.UserId != currentUserId) return null;

        entity.Status = dto.Status;
        await _context.SaveChangesAsync(cancellationToken);

        return new EventAttendeeDto
        {
            Id = entity.Id,
            EventId = entity.EventId,
            UserId = entity.UserId,
            UserName = entity.User?.Name ?? string.Empty,
            Status = entity.Status
        };
    }

    public async Task<bool> RemoveAttendeeAsync(Guid attendeeId, Guid currentUserId, CancellationToken cancellationToken)
    {
        var entity = await _context.EventAttendees.FindAsync(new object[] { attendeeId }, cancellationToken);
        if (entity == null) return false;

        var ev = await _context.Events.FindAsync(new object[] { entity.EventId }, cancellationToken);
        
        // Katılımcıyı etkinlik sahibi silebilir veya katılımcı kendisi iptal edebilir
        if (ev?.UserId != currentUserId && entity.UserId != currentUserId) return false;

        _context.EventAttendees.Remove(entity); // Soft Delete
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static EventDto MapToDto(Event e)
    {
        return new EventDto
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            Type = e.Type,
            Location = e.Location,
            UserId = e.UserId,
            UserName = e.User?.Name ?? string.Empty,
            Attendees = e.Attendees.Where(a => !a.IsDeleted).Select(a => new EventAttendeeDto
            {
                Id = a.Id,
                EventId = a.EventId,
                UserId = a.UserId,
                UserName = a.User?.Name ?? string.Empty,
                Status = a.Status
            }).ToList()
        };
    }
}
