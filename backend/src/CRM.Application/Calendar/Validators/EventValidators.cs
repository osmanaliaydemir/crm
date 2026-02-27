using CRM.Application.Calendar.DTOs;
using FluentValidation;

namespace CRM.Application.Calendar.Validators;

public class CreateEventValidator : AbstractValidator<CreateEventDto>
{
    public CreateEventValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThan(x => x.StartDate)
            .WithMessage("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
        RuleFor(x => x.Type).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Location).MaximumLength(500);
    }
}

public class UpdateEventValidator : AbstractValidator<UpdateEventDto>
{
    public UpdateEventValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThan(x => x.StartDate)
            .WithMessage("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
        RuleFor(x => x.Type).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Location).MaximumLength(500);
    }
}

public class AddAttendeeValidator : AbstractValidator<AddAttendeeDto>
{
    public AddAttendeeValidator()
    {
        RuleFor(x => x.EventId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public class UpdateAttendeeStatusValidator : AbstractValidator<UpdateAttendeeStatusDto>
{
    public UpdateAttendeeStatusValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).Must(x => x == "Bekliyor" || x == "Katılacak" || x == "Katılmayacak" || x == "Belirsiz")
            .WithMessage("Geçersiz katılım durumu.");
    }
}
