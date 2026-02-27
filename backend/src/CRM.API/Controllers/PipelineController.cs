using CRM.Application.Pipeline.DTOs;
using CRM.Application.Pipeline.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "SalesAccess")]
public class PipelineController : ControllerBase
{
    private readonly IPipelineService _pipelineService;

    public PipelineController(IPipelineService pipelineService)
    {
        _pipelineService = pipelineService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var deals = await _pipelineService.GetDealsAsync(cancellationToken);
        return Ok(deals);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var deal = await _pipelineService.GetDealByIdAsync(id, cancellationToken);
        if (deal == null) return NotFound();
        return Ok(deal);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePipelineDealDto dto, CancellationToken cancellationToken)
    {
        var deal = await _pipelineService.CreateDealAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = deal.Id }, deal);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePipelineDealDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşmazlığı.");
        
        var result = await _pipelineService.UpdateDealAsync(dto, cancellationToken);
        if (!result) return NotFound();
        
        return NoContent();
    }

    [HttpPatch("{id}/stage")]
    public async Task<IActionResult> UpdateStage(Guid id, [FromBody] UpdatePipelineDealStageDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id) return BadRequest("ID uyuşmazlığı.");
        
        var result = await _pipelineService.UpdateDealStageAsync(dto, cancellationToken);
        if (!result) return NotFound();
        
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // Silme işlemi sadece admin
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _pipelineService.DeleteDealAsync(id, cancellationToken);
        if (!result) return NotFound();
        
        return NoContent();
    }
}
