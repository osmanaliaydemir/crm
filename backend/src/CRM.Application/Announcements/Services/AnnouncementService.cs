using CRM.Application.Announcements.DTOs;
using CRM.Application.Announcements.Interfaces;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Announcements.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly IApplicationDbContext _context;

    public AnnouncementService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<AnnouncementDto>> GetActiveAnnouncementsAsync(CancellationToken cancellationToken)
    {
        return await _context.Announcements
            .Include(a => a.PublishedBy)
            .Where(a => a.IsActive)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Content = a.Content,
                Type = a.Type,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                PublishedById = a.PublishedById,
                PublishedByNames = a.PublishedBy.Name
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<AnnouncementDto>> GetAllAnnouncementsAsync(CancellationToken cancellationToken)
    {
        return await _context.Announcements
            .Include(a => a.PublishedBy)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AnnouncementDto
            {
                Id = a.Id,
                Title = a.Title,
                Content = a.Content,
                Type = a.Type,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                PublishedById = a.PublishedById,
                PublishedByNames = a.PublishedBy.Name
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<AnnouncementDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var a = await _context.Announcements
            .Include(a => a.PublishedBy)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (a == null) return null;

        return new AnnouncementDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            Type = a.Type,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedAt,
            PublishedById = a.PublishedById,
            PublishedByNames = a.PublishedBy.Name
        };
    }

    public async Task<AnnouncementDto> CreateAsync(CreateAnnouncementDto dto, Guid userId, CancellationToken cancellationToken)
    {
        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Content = dto.Content,
            Type = dto.Type,
            IsActive = dto.IsActive,
            PublishedById = userId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId.ToString()
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetByIdAsync(announcement.Id, cancellationToken))!;
    }

    public async Task<bool> UpdateAsync(UpdateAnnouncementDto dto, CancellationToken cancellationToken)
    {
        var a = await _context.Announcements.FindAsync(new object[] { dto.Id }, cancellationToken);
        if (a == null) return false;

        a.Title = dto.Title;
        a.Content = dto.Content;
        a.Type = dto.Type;
        a.IsActive = dto.IsActive;
        a.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> ToggleStatusAsync(Guid id, CancellationToken cancellationToken)
    {
        var a = await _context.Announcements.FindAsync(new object[] { id }, cancellationToken);
        if (a == null) return false;

        a.IsActive = !a.IsActive;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var a = await _context.Announcements.FindAsync(new object[] { id }, cancellationToken);
        if (a == null) return false;

        _context.Announcements.Remove(a);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
