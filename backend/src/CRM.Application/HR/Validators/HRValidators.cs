using CRM.Application.HR.DTOs;
using FluentValidation;

namespace CRM.Application.HR.Validators;

public class CreateLeaveRequestValidator : AbstractValidator<CreateLeaveRequestDto>
{
    public CreateLeaveRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Type).NotEmpty().MaximumLength(100);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThanOrEqualTo(x => x.StartDate).WithMessage("Bitiş tarihi başlangıç tarihinden önce olamaz.");
        RuleFor(x => x.Reason).MaximumLength(500);
    }
}

public class UpdateLeaveRequestStatusValidator : AbstractValidator<UpdateLeaveRequestStatusDto>
{
    public UpdateLeaveRequestStatusValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ApprovedById).NotEmpty();
        RuleFor(x => x.Status).Must(x => x == "Onaylandı" || x == "Reddedildi")
            .WithMessage("Geçersiz izin durumu.");
    }
}

public class CreateExpenseValidator : AbstractValidator<CreateExpenseDto>
{
    public CreateExpenseValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Date).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(500);
    }
}

public class UpdateExpenseStatusValidator : AbstractValidator<UpdateExpenseStatusDto>
{
    public UpdateExpenseStatusValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.ApprovedById).NotEmpty();
        RuleFor(x => x.Status).Must(x => x == "Ödendi" || x == "Reddedildi")
            .WithMessage("Geçersiz masraf durumu.");
    }
}

public class CreatePerformanceEvaluationValidator : AbstractValidator<CreatePerformanceEvaluationDto>
{
    public CreatePerformanceEvaluationValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.EvaluatorId).NotEmpty();
        RuleFor(x => x.Score).InclusiveBetween(0, 100);
        RuleFor(x => x.Feedback).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.EvaluationDate).NotEmpty();
        RuleFor(x => x.Period).NotEmpty().MaximumLength(50);
    }
}

public class CreatePayrollValidator : AbstractValidator<CreatePayrollDto>
{
    public CreatePayrollValidator()
    {
        RuleFor(x => x.EmployeeId).NotEmpty();
        RuleFor(x => x.Period).NotEmpty().MaximumLength(50);
        RuleFor(x => x.BasicSalary).GreaterThan(0);
        RuleFor(x => x.Bonus).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Deductions).GreaterThanOrEqualTo(0);
    }
}
