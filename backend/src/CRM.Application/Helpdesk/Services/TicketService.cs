using CRM.Application.Common.Interfaces;
using CRM.Application.Helpdesk.DTOs;
using CRM.Application.Helpdesk.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Helpdesk.Services;

public class TicketService : ITicketService
{
    private readonly IApplicationDbContext _context;

    public TicketService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TicketDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var tickets = await _context.Tickets
            .Include(t => t.Customer)
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedTo)
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return tickets.Select(MapToDto);
    }

    public async Task<IEnumerable<TicketDto>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken)
    {
        var tickets = await _context.Tickets
            .Include(t => t.Customer)
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedTo)
            .AsNoTracking()
            .Where(t => t.CustomerId == customerId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        return tickets.Select(MapToDto);
    }

    public async Task<TicketDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Customer)
            .Include(t => t.CreatedByUser)
            .Include(t => t.AssignedTo)
            .Include(t => t.Comments)
                .ThenInclude(c => c.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

        if (ticket == null) return null;

        var dto = MapToDto(ticket);
        
        dto.Comments = ticket.Comments.OrderBy(c => c.CreatedAt).Select(c => new TicketCommentDto
        {
            Id = c.Id,
            TicketId = c.TicketId,
            UserId = c.UserId,
            UserName = c.User?.Name ?? string.Empty,
            Content = c.Content,
            CreatedAt = c.CreatedAt
        }).ToList();

        return dto;
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto dto, Guid? createdByUserId, CancellationToken cancellationToken)
    {
        var entity = new Ticket
        {
            Subject = dto.Subject,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = "Açık",
            CustomerId = dto.CustomerId,
            CreatedByUserId = createdByUserId
        };

        _context.Tickets.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.Id, cancellationToken) ?? throw new Exception("Failed to return the created ticket.");
    }

    public async Task<TicketDto?> UpdateStatusAsync(UpdateTicketStatusDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == dto.Id, cancellationToken);
        if (entity == null) return null;

        entity.Status = dto.Status;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.Id, cancellationToken);
    }

    public async Task<TicketDto?> AssignToAsync(AssignTicketDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Tickets.FirstOrDefaultAsync(t => t.Id == dto.Id, cancellationToken);
        if (entity == null) return null;

        entity.AssignedToId = dto.AssignedToId;
        entity.Status = "İncelemede"; // Atandıktan sonra varsayılan olarak Incelemede yapıyoruz
        
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.Id, cancellationToken);
    }

    public async Task<TicketCommentDto> AddCommentAsync(CreateTicketCommentDto dto, Guid userId, CancellationToken cancellationToken)
    {
        var entity = new TicketComment
        {
            TicketId = dto.TicketId,
            Content = dto.Content,
            UserId = userId
        };

        _context.TicketComments.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var user = await _context.Users.FindAsync(new object[] { userId }, cancellationToken);

        return new TicketCommentDto
        {
            Id = entity.Id,
            TicketId = entity.TicketId,
            UserId = entity.UserId,
            UserName = user?.Name ?? string.Empty,
            Content = entity.Content,
            CreatedAt = entity.CreatedAt
        };
    }

    private static TicketDto MapToDto(Ticket t)
    {
        return new TicketDto
        {
            Id = t.Id,
            Subject = t.Subject,
            Description = t.Description,
            Priority = t.Priority,
            Status = t.Status,
            CustomerId = t.CustomerId,
            CustomerName = t.Customer?.Name,
            CreatedByUserId = t.CreatedByUserId,
            CreatedByUserName = t.CreatedByUser?.Name,
            AssignedToId = t.AssignedToId,
            AssignedToName = t.AssignedTo?.Name,
            CreatedAt = t.CreatedAt
        };
    }
}
