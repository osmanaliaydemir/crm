using CRM.Application.Documents.DTOs;
using FluentValidation;

namespace CRM.Application.Documents.Validators;

public class UploadDocumentValidator : AbstractValidator<UploadDocumentDto>
{
    public UploadDocumentValidator()
    {
        RuleFor(x => x.EntityType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.EntityId).NotEmpty();
    }
}
