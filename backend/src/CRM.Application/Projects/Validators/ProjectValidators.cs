using CRM.Application.Projects.DTOs;
using FluentValidation;

namespace CRM.Application.Projects.Validators;

public class CreateProjectValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).GreaterThanOrEqualTo(x => x.StartDate).When(x => x.EndDate.HasValue)
            .WithMessage("Bitiş tarihi başlangıç tarihinden önce olamaz.");
    }
}

public class CreateProjectTaskValidator : AbstractValidator<CreateProjectTaskDto>
{
    public CreateProjectTaskValidator()
    {
        RuleFor(x => x.ProjectId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.Priority).Must(x => x == "Düşük" || x == "Normal" || x == "Yüksek" || x == "Acil")
            .WithMessage("Geçersiz öncelik seviyesi.");
    }
}

public class UpdateProjectTaskStatusValidator : AbstractValidator<UpdateProjectTaskStatusDto>
{
    public UpdateProjectTaskStatusValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).Must(x => x == "To Do" || x == "In Progress" || x == "In Review" || x == "Done")
            .WithMessage("Geçersiz görev durumu (Yalnızca: To Do, In Progress, In Review, Done kabul edilir).");
    }
}

public class AssignProjectTaskValidator : AbstractValidator<AssignProjectTaskDto>
{
    public AssignProjectTaskValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AssignedToId).NotEmpty();
    }
}
