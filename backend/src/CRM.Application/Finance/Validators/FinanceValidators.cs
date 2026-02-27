using CRM.Application.Finance.DTOs;
using FluentValidation;

namespace CRM.Application.Finance.Validators;

public class CreateBankAccountValidator : AbstractValidator<CreateBankAccountDto>
{
    public CreateBankAccountValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(100);
        RuleFor(x => x.Type).Must(x => x == "Hesap" || x == "Kasa" || x == "Kredi Kartı" || x == "Banka").WithMessage("Geçersiz hesap tipi");
    }
}

public class CreateTransactionValidator : AbstractValidator<CreateTransactionDto>
{
    public CreateTransactionValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MinimumLength(2).MaximumLength(500);
        RuleFor(x => x.Type).Must(x => x == "in" || x == "out").WithMessage("Tip 'in' veya 'out' olabilir.");
        RuleFor(x => x.Category).NotEmpty().MinimumLength(2).MaximumLength(50);
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(0).WithMessage("Tutar 0'dan küçük olamaz");
        RuleFor(x => x.Status).NotEmpty();
    }
}

public class UpdateTransactionStatusValidator : AbstractValidator<UpdateTransactionStatusDto>
{
    public UpdateTransactionStatusValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).Must(x => x == "Tamamlandı" || x == "Bekliyor" || x == "İptal Edildi");
    }
}

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceDto>
{
    public CreateInvoiceValidator()
    {
        RuleFor(x => x.InvoiceNumber).NotEmpty().MaximumLength(20);
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.TaxRate).InclusiveBetween(0, 100);
        RuleFor(x => x.Items).NotEmpty().WithMessage("Faturada en az bir kalem bulunmalıdır.");
        RuleForEach(x => x.Items).SetValidator(new CreateInvoiceItemValidator());
    }
}

public class CreateInvoiceItemValidator : AbstractValidator<CreateInvoiceItemDto>
{
    public CreateInvoiceItemValidator()
    {
        RuleFor(x => x.Description).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
    }
}
