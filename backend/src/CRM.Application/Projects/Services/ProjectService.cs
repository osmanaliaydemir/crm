using CRM.Application.Common.Interfaces;
using CRM.Application.Projects.DTOs;
using CRM.Application.Projects.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Projects.Services;

public class ProjectService : IProjectService
{
    private readonly IApplicationDbContext _context;

    public ProjectService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProjectDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var projects = await _context.Projects
            .Include(p => p.Customer)
            .AsNoTracking()
            .OrderByDescending(p => p.StartDate)
            .ToListAsync(cancellationToken);

        return projects.Select(MapToDto);
    }

    public async Task<ProjectDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var project = await _context.Projects
            .Include(p => p.Customer)
            .Include(p => p.Tasks)
                .ThenInclude(t => t.AssignedTo)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (project == null) return null;

        var dto = MapToDto(project);

        dto.Tasks = project.Tasks.OrderBy(t => t.DueDate ?? DateTime.MaxValue).Select(t => new ProjectTaskDto
        {
            Id = t.Id,
            ProjectId = t.ProjectId,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            DueDate = t.DueDate,
            AssignedToId = t.AssignedToId,
            AssignedToName = t.AssignedTo?.Name ?? string.Empty
        }).ToList();

        return dto;
    }

    public async Task<ProjectDto> CreateAsync(CreateProjectDto dto, CancellationToken cancellationToken)
    {
        var entity = new Project
        {
            Name = dto.Name,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Status = "Planlanıyor",
            CustomerId = dto.CustomerId
        };

        _context.Projects.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(entity.Id, cancellationToken) ?? throw new Exception("Proje oluşturulamadı.");
    }

    public async Task<ProjectTaskDto> AddTaskAsync(CreateProjectTaskDto dto, CancellationToken cancellationToken)
    {
        var entity = new ProjectTask
        {
            ProjectId = dto.ProjectId,
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            DueDate = dto.DueDate,
            AssignedToId = dto.AssignedToId,
            Status = "To Do"
        };

        _context.ProjectTasks.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var taskWithUser = await _context.ProjectTasks
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == entity.Id, cancellationToken);
            
        return new ProjectTaskDto
        {
            Id = entity.Id,
            ProjectId = entity.ProjectId,
            Title = entity.Title,
            Description = entity.Description,
            Status = entity.Status,
            Priority = entity.Priority,
            DueDate = entity.DueDate,
            AssignedToId = entity.AssignedToId,
            AssignedToName = taskWithUser?.AssignedTo?.Name ?? string.Empty
        };
    }

    public async Task<ProjectTaskDto?> UpdateTaskStatusAsync(UpdateProjectTaskStatusDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.ProjectTasks
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == dto.Id, cancellationToken);

        if (entity == null) return null;

        entity.Status = dto.Status;
        await _context.SaveChangesAsync(cancellationToken);

        return new ProjectTaskDto
        {
            Id = entity.Id,
            ProjectId = entity.ProjectId,
            Title = entity.Title,
            Description = entity.Description,
            Status = entity.Status,
            Priority = entity.Priority,
            DueDate = entity.DueDate,
            AssignedToId = entity.AssignedToId,
            AssignedToName = entity.AssignedTo?.Name ?? string.Empty
        };
    }

    public async Task<ProjectTaskDto?> AssignTaskAsync(AssignProjectTaskDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.ProjectTasks.FirstOrDefaultAsync(t => t.Id == dto.Id, cancellationToken);
        if (entity == null) return null;

        entity.AssignedToId = dto.AssignedToId;
        await _context.SaveChangesAsync(cancellationToken);

        var taskWithUser = await _context.ProjectTasks
            .Include(t => t.AssignedTo)
            .FirstOrDefaultAsync(t => t.Id == dto.Id, cancellationToken);

        return new ProjectTaskDto
        {
            Id = entity.Id,
            ProjectId = entity.ProjectId,
            Title = entity.Title,
            Description = entity.Description,
            Status = entity.Status,
            Priority = entity.Priority,
            DueDate = entity.DueDate,
            AssignedToId = entity.AssignedToId,
            AssignedToName = taskWithUser?.AssignedTo?.Name ?? string.Empty
        };
    }

    public async Task<bool> DeleteTaskAsync(Guid taskId, CancellationToken cancellationToken)
    {
        var entity = await _context.ProjectTasks.FindAsync(new object[] { taskId }, cancellationToken);
        if (entity == null) return false;

        _context.ProjectTasks.Remove(entity); // Soft Delete
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ProjectDto MapToDto(Project p)
    {
        return new ProjectDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Status = p.Status,
            CustomerId = p.CustomerId,
            CustomerName = p.Customer?.Name
        };
    }
}
