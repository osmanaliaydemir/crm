namespace CRM.Application.Projects.DTOs;

public class ProjectTaskDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    
    public Guid? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
}

public class ProjectDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    
    public List<ProjectTaskDto> Tasks { get; set; } = new();
}

public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public Guid? CustomerId { get; set; }
}

public class CreateProjectTaskDto
{
    public Guid ProjectId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
    public DateTime? DueDate { get; set; }
    public Guid? AssignedToId { get; set; }
}

public class UpdateProjectTaskStatusDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty; // To Do, In Progress, In Review, Done
}

public class AssignProjectTaskDto
{
    public Guid Id { get; set; }
    public Guid AssignedToId { get; set; }
}
