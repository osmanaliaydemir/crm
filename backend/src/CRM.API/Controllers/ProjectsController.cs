using CRM.Application.Projects.DTOs;
using CRM.Application.Projects.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "EmployeeAccess")] // Admin, HR ve Employee erişebilir
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IValidator<CreateProjectDto> _createProjectValidator;
    private readonly IValidator<CreateProjectTaskDto> _createTaskValidator;
    private readonly IValidator<UpdateProjectTaskStatusDto> _updateTaskStatusValidator;
    private readonly IValidator<AssignProjectTaskDto> _assignTaskValidator;

    public ProjectsController(
        IProjectService projectService,
        IValidator<CreateProjectDto> createProjectValidator,
        IValidator<CreateProjectTaskDto> createTaskValidator,
        IValidator<UpdateProjectTaskStatusDto> updateTaskStatusValidator,
        IValidator<AssignProjectTaskDto> assignTaskValidator)
    {
        _projectService = projectService;
        _createProjectValidator = createProjectValidator;
        _createTaskValidator = createTaskValidator;
        _updateTaskStatusValidator = updateTaskStatusValidator;
        _assignTaskValidator = assignTaskValidator;
    }

    [HttpGet]
    [Authorize(Policy = "HRAccess")] // Support yerine HR/Admin poliçesi kullanımı (Program.cs uyumu)
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _projectService.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _projectService.GetByIdAsync(id, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProjectDto dto, CancellationToken cancellationToken)
    {
        var validationResult = await _createProjectValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _projectService.CreateAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{projectId}/tasks")]
    [Authorize]
    public async Task<IActionResult> AddTask(Guid projectId, [FromBody] CreateProjectTaskDto dto, CancellationToken cancellationToken)
    {
        if (projectId != dto.ProjectId) return BadRequest("Proje ID uyuşulmuyor");

        var validationResult = await _createTaskValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _projectService.AddTaskAsync(dto, cancellationToken);
        return Ok(result);
    }

    [HttpPatch("tasks/{taskId}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateTaskStatus(Guid taskId, [FromBody] UpdateProjectTaskStatusDto dto, CancellationToken cancellationToken)
    {
        if (taskId != dto.Id) return BadRequest("Görev ID uyuşulmuyor");

        var validationResult = await _updateTaskStatusValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _projectService.UpdateTaskStatusAsync(dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpPost("tasks/{taskId}/assign")]
    public async Task<IActionResult> AssignTask(Guid taskId, [FromBody] AssignProjectTaskDto dto, CancellationToken cancellationToken)
    {
        if (taskId != dto.Id) return BadRequest("Görev ID uyuşulmuyor");

        var validationResult = await _assignTaskValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        var result = await _projectService.AssignTaskAsync(dto, cancellationToken);
        if (result == null) return NotFound();

        return Ok(result);
    }

    [HttpDelete("tasks/{taskId}")]
    public async Task<IActionResult> DeleteTask(Guid taskId, CancellationToken cancellationToken)
    {
        var result = await _projectService.DeleteTaskAsync(taskId, cancellationToken);
        if (!result) return NotFound();

        return NoContent();
    }
}
