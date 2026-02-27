using CRM.Application.Inventory.DTOs;
using FluentValidation;

namespace CRM.Application.Inventory.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductDto>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.SKU).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinimumStockLevel).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Status).Must(x => x == "Aktif" || x == "Pasif" || x == "Tükendi");
    }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductDto>
{
    public UpdateProductValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MinimumLength(2).MaximumLength(200);
        RuleFor(x => x.SKU).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinimumStockLevel).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Status).Must(x => x == "Aktif" || x == "Pasif" || x == "Tükendi");
    }
}

public class CreateStockMovementValidator : AbstractValidator<CreateStockMovementDto>
{
    public CreateStockMovementValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Type).Must(x => x == "Giriş" || x == "Çıkış" || x == "İade").WithMessage("Geçersiz stok hareketi tipi.");
        RuleFor(x => x.Quantity).GreaterThan(0); // quantity should always be positive, type determines if it subtracts or adds
        RuleFor(x => x.Date).NotEmpty();
    }
}
