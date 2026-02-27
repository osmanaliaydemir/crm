using CRM.Application.Projects.DTOs;

namespace CRM.Application.Projects.Interfaces;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<ProjectDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ProjectDto> CreateAsync(CreateProjectDto dto, CancellationToken cancellationToken);
    
    Task<ProjectTaskDto> AddTaskAsync(CreateProjectTaskDto dto, CancellationToken cancellationToken);
    Task<ProjectTaskDto?> UpdateTaskStatusAsync(UpdateProjectTaskStatusDto dto, CancellationToken cancellationToken);
    Task<ProjectTaskDto?> AssignTaskAsync(AssignProjectTaskDto dto, CancellationToken cancellationToken);
    Task<bool> DeleteTaskAsync(Guid taskId, CancellationToken cancellationToken);
}
