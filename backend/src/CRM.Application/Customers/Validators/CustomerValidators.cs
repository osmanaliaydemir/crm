using CRM.Application.Customers.DTOs;
using FluentValidation;

namespace CRM.Application.Customers.Validators;

public class CreateCustomerValidator : AbstractValidator<CreateCustomerDto>
{
    public CreateCustomerValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.ContactName).NotEmpty().MinimumLength(2).MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
        RuleFor(x => x.Phone).NotEmpty().MinimumLength(10).MaximumLength(20);
        RuleFor(x => x.City).NotEmpty().MinimumLength(2).MaximumLength(50);
        RuleFor(x => x.Type).Must(x => x == "B2B" || x == "B2C").WithMessage("Geçersiz müşteri tipi.");
        RuleFor(x => x.HealthScore).InclusiveBetween(0, 100);
    }
}

public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerDto>
{
    public UpdateCustomerValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.ContactName).NotEmpty().MinimumLength(2).MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(150);
        RuleFor(x => x.Phone).NotEmpty().MinimumLength(10).MaximumLength(20);
        RuleFor(x => x.City).NotEmpty().MinimumLength(2).MaximumLength(50);
        RuleFor(x => x.Type).Must(x => x == "B2B" || x == "B2C").WithMessage("Geçersiz müşteri tipi.");
        RuleFor(x => x.HealthScore).InclusiveBetween(0, 100);
    }
}
