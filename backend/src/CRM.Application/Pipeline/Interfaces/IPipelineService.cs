using CRM.Application.Pipeline.DTOs;

namespace CRM.Application.Pipeline.Interfaces;

public interface IPipelineService
{
    Task<List<PipelineDealDto>> GetDealsAsync(CancellationToken cancellationToken);
    Task<PipelineDealDto?> GetDealByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<PipelineDealDto> CreateDealAsync(CreatePipelineDealDto dto, CancellationToken cancellationToken);
    Task<bool> UpdateDealAsync(UpdatePipelineDealDto dto, CancellationToken cancellationToken);
    Task<bool> UpdateDealStageAsync(UpdatePipelineDealStageDto dto, CancellationToken cancellationToken);
    Task<bool> DeleteDealAsync(Guid id, CancellationToken cancellationToken);
}
