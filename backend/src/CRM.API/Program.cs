using System.Text;
using CRM.Application;
using CRM.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", cors => cors
        .WithOrigins("http://localhost:3000") // Frontend address
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? "FallbackSecretKey12345678901234567890";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
        };
    });

// RBAC Authorization
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", p => p.RequireRole("admin"))
    .AddPolicy("HRAccess", p => p.RequireRole("admin", "hr"))
    .AddPolicy("FinanceAccess", p => p.RequireRole("admin", "finance"))
    .AddPolicy("SalesAccess", p => p.RequireRole("admin", "sales"))
    .AddPolicy("EmployeeAccess", p => p.RequireRole("admin", "hr", "employee"))
    .AddPolicy("B2BAccess", p => p.RequireRole("admin", "customer"))
    .AddPolicy("CustomerOnly", p => p.RequireRole("customer"));

var app = builder.Build();

// Migrate and seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<CRM.Infrastructure.Persistence.CrmDbContext>();
        await CRM.Infrastructure.Data.CrmDbContextSeed.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options =>
    {
        options.RouteTemplate = "openapi/{documentName}.json";
    });
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("CRM API Reference")
               .WithTheme(ScalarTheme.DeepSpace);
    });
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "CRM API v1");
    });
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
