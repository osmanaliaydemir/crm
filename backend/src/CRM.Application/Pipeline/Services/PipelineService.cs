using CRM.Application.Common.Interfaces;
using CRM.Application.Pipeline.DTOs;
using CRM.Application.Pipeline.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Pipeline.Services;

public class PipelineService : IPipelineService
{
    private readonly IApplicationDbContext _context;

    public PipelineService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PipelineDealDto>> GetDealsAsync(CancellationToken cancellationToken)
    {
        return await _context.PipelineDeals
            .Include(d => d.Customer)
            .Include(d => d.AssignedTo)
            .OrderBy(d => d.SortOrder)
            .Select(d => new PipelineDealDto
            {
                Id = d.Id,
                Title = d.Title,
                Description = d.Description,
                Stage = d.Stage,
                Value = d.Value,
                Probability = d.Probability,
                CustomerId = d.CustomerId,
                CustomerName = d.Customer.Name,
                AssignedToId = d.AssignedToId,
                AssignedToName = d.AssignedTo != null ? d.AssignedTo.Name : null,
                ExpectedCloseDate = d.ExpectedCloseDate,
                SortOrder = d.SortOrder,
                CreatedAt = d.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<PipelineDealDto?> GetDealByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var d = await _context.PipelineDeals
            .Include(d => d.Customer)
            .Include(d => d.AssignedTo)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (d == null) return null;

        return new PipelineDealDto
        {
            Id = d.Id,
            Title = d.Title,
            Description = d.Description,
            Stage = d.Stage,
            Value = d.Value,
            Probability = d.Probability,
            CustomerId = d.CustomerId,
            CustomerName = d.Customer.Name,
            AssignedToId = d.AssignedToId,
            AssignedToName = d.AssignedTo != null ? d.AssignedTo.Name : null,
            ExpectedCloseDate = d.ExpectedCloseDate,
            SortOrder = d.SortOrder,
            CreatedAt = d.CreatedAt
        };
    }

    public async Task<PipelineDealDto> CreateDealAsync(CreatePipelineDealDto dto, CancellationToken cancellationToken)
    {
        var deal = new PipelineDeal
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Stage = dto.Stage,
            Value = dto.Value,
            Probability = dto.Probability,
            CustomerId = dto.CustomerId,
            AssignedToId = dto.AssignedToId,
            ExpectedCloseDate = dto.ExpectedCloseDate,
            SortOrder = await _context.PipelineDeals.CountAsync(x => x.Stage == dto.Stage, cancellationToken)
        };

        _context.PipelineDeals.Add(deal);
        await _context.SaveChangesAsync(cancellationToken);

        return (await GetDealByIdAsync(deal.Id, cancellationToken))!;
    }

    public async Task<bool> UpdateDealAsync(UpdatePipelineDealDto dto, CancellationToken cancellationToken)
    {
        var deal = await _context.PipelineDeals.FindAsync(new object[] { dto.Id }, cancellationToken);
        if (deal == null) return false;

        deal.Title = dto.Title;
        deal.Description = dto.Description;
        deal.Stage = dto.Stage;
        deal.Value = dto.Value;
        deal.Probability = dto.Probability;
        deal.CustomerId = dto.CustomerId;
        deal.AssignedToId = dto.AssignedToId;
        deal.ExpectedCloseDate = dto.ExpectedCloseDate;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UpdateDealStageAsync(UpdatePipelineDealStageDto dto, CancellationToken cancellationToken)
    {
        var deal = await _context.PipelineDeals.FindAsync(new object[] { dto.Id }, cancellationToken);
        if (deal == null) return false;

        deal.Stage = dto.NewStage;
        deal.SortOrder = dto.NewSortOrder;

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteDealAsync(Guid id, CancellationToken cancellationToken)
    {
        var deal = await _context.PipelineDeals.FindAsync(new object[] { id }, cancellationToken);
        if (deal == null) return false;

        _context.PipelineDeals.Remove(deal);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
