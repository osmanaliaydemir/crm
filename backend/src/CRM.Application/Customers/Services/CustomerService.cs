using CRM.Application.Common.Interfaces;
using CRM.Application.Customers.DTOs;
using CRM.Application.Customers.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Customers.Services;

public class CustomerService : ICustomerService
{
    private readonly IApplicationDbContext _context;

    public CustomerService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CustomerDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var customers = await _context.Customers
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return customers.Select(MapToDto);
    }

    public async Task<CustomerDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var customer = await _context.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return customer == null ? null : MapToDto(customer);
    }

    public async Task<CustomerDto> CreateAsync(CreateCustomerDto dto, CancellationToken cancellationToken)
    {
        var entity = new Customer
        {
            Name = dto.Name,
            Type = dto.Type,
            ContactName = dto.ContactName,
            Email = dto.Email,
            Phone = dto.Phone,
            City = dto.City,
            Status = dto.Status,
            HealthScore = dto.HealthScore
        };

        _context.Customers.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<CustomerDto?> UpdateAsync(Guid id, UpdateCustomerDto dto, CancellationToken cancellationToken)
    {
        var entity = await _context.Customers.FindAsync(new object[] { id }, cancellationToken);

        if (entity == null) return null;

        entity.Name = dto.Name;
        entity.Type = dto.Type;
        entity.ContactName = dto.ContactName;
        entity.Email = dto.Email;
        entity.Phone = dto.Phone;
        entity.City = dto.City;
        entity.Status = dto.Status;
        entity.HealthScore = dto.HealthScore;

        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _context.Customers.FindAsync(new object[] { id }, cancellationToken);

        if (entity == null) return false;

        _context.Customers.Remove(entity); // Soft delete via interceptor
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<IEnumerable<InteractionDto>> GetInteractionsAsync(Guid customerId, CancellationToken cancellationToken)
    {
        var interactions = await _context.Interactions
            .AsNoTracking()
            .Where(i => i.CustomerId == customerId)
            .OrderByDescending(i => i.Date)
            .ToListAsync(cancellationToken);

        return interactions.Select(MapToDto);
    }

    public async Task<InteractionDto> AddInteractionAsync(Guid customerId, CreateInteractionDto dto, CancellationToken cancellationToken)
    {
        var entity = new Interaction
        {
            CustomerId = customerId,
            Type = dto.Type,
            Title = dto.Title,
            Description = dto.Description,
            Date = dto.Date
        };

        _context.Interactions.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    public async Task<IEnumerable<CustomerFileDto>> GetFilesAsync(Guid customerId, CancellationToken cancellationToken)
    {
        var files = await _context.CustomerFiles
            .AsNoTracking()
            .Where(f => f.CustomerId == customerId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync(cancellationToken);

        return files.Select(MapToDto);
    }

    public async Task<CustomerFileDto> AddFileAsync(Guid customerId, CreateCustomerFileDto dto, CancellationToken cancellationToken)
    {
        var entity = new CustomerFile
        {
            CustomerId = customerId,
            FileName = dto.FileName,
            FileSize = dto.FileSize,
            ContentType = dto.ContentType,
            StoragePath = dto.StoragePath
        };

        _context.CustomerFiles.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return MapToDto(entity);
    }

    private static CustomerDto MapToDto(Customer entity)
    {
        return new CustomerDto
        {
            Id = entity.Id,
            Name = entity.Name,
            Type = entity.Type,
            ContactName = entity.ContactName,
            Email = entity.Email,
            Phone = entity.Phone,
            City = entity.City,
            Status = entity.Status,
            HealthScore = entity.HealthScore
        };
    }

    private static InteractionDto MapToDto(Interaction entity)
    {
        return new InteractionDto
        {
            Id = entity.Id,
            CustomerId = entity.CustomerId,
            Type = entity.Type,
            Title = entity.Title,
            Description = entity.Description,
            Date = entity.Date
        };
    }

    private static CustomerFileDto MapToDto(CustomerFile entity)
    {
        return new CustomerFileDto
        {
            Id = entity.Id,
            CustomerId = entity.CustomerId,
            FileName = entity.FileName,
            FileSize = entity.FileSize,
            ContentType = entity.ContentType,
            StoragePath = entity.StoragePath
        };
    }
}
