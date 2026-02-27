using CRM.Application.Orders.DTOs;
using FluentValidation;

namespace CRM.Application.Orders.Validators;

public class CreateOrderValidator : AbstractValidator<CreateOrderDto>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.OrderNumber).NotEmpty().MaximumLength(50);
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Sipariş en az bir kalem içermelidir.");
        RuleForEach(x => x.Items).SetValidator(new CreateOrderItemValidator());
    }
}

public class CreateOrderItemValidator : AbstractValidator<CreateOrderItemDto>
{
    public CreateOrderItemValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0);
    }
}

public class UpdateOrderStatusValidator : AbstractValidator<UpdateOrderStatusDto>
{
    public UpdateOrderStatusValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Status).Must(x => x == "Yeni" || x == "Hazırlanıyor" || x == "Kargolandı" || x == "Teslim Edildi" || x == "İptal")
            .WithMessage("Geçersiz sipariş durumu.");
        When(x => x.Status == "Teslim Edildi", () =>
        {
            RuleFor(x => x.DeliveryDate).NotEmpty().WithMessage("Teslim statüsünde teslim tarihi zorunludur.");
        });
    }
}
