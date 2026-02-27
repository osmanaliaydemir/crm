using CRM.Application.Helpdesk.DTOs;
using FluentValidation;

namespace CRM.Application.Helpdesk.Validators;

public class CreateTicketValidator : AbstractValidator<CreateTicketDto>
{
    public CreateTicketValidator()
    {
        RuleFor(x => x.Subject).NotEmpty().MinimumLength(5).MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.Priority).Must(x => x == "Düşük" || x == "Normal" || x == "Yüksek" || x == "Acil")
            .WithMessage("Geçersiz öncelik seviyesi.");
    }
}

public class UpdateTicketStatusValidator : AbstractValidator<UpdateTicketStatusDto>
{
    public UpdateTicketStatusValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).Must(x => x == "Açık" || x == "İncelemede" || x == "Beklemede" || x == "Çözüldü" || x == "Kapalı")
            .WithMessage("Geçersiz bilet durumu.");
    }
}

public class AssignTicketValidator : AbstractValidator<AssignTicketDto>
{
    public AssignTicketValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.AssignedToId).NotEmpty();
    }
}

public class CreateTicketCommentValidator : AbstractValidator<CreateTicketCommentDto>
{
    public CreateTicketCommentValidator()
    {
        RuleFor(x => x.TicketId).NotEmpty();
        RuleFor(x => x.Content).NotEmpty().MaximumLength(2000);
    }
}
