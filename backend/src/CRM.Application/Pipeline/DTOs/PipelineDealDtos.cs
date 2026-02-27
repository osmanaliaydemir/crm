using CRM.Domain.Enums;

namespace CRM.Application.Pipeline.DTOs;

public class PipelineDealDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DealStage Stage { get; set; }
    public string StageName => Stage.ToString();
    public decimal Value { get; set; }
    public int Probability { get; set; }
    
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    
    public Guid? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    
    public DateTime? ExpectedCloseDate { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreatePipelineDealDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DealStage Stage { get; set; } = DealStage.Lead;
    public decimal Value { get; set; }
    public int Probability { get; set; }
    public Guid CustomerId { get; set; }
    public Guid? AssignedToId { get; set; }
    public DateTime? ExpectedCloseDate { get; set; }
}

public class UpdatePipelineDealDto : CreatePipelineDealDto
{
    public Guid Id { get; set; }
}

public class UpdatePipelineDealStageDto
{
    public Guid Id { get; set; }
    public DealStage NewStage { get; set; }
    public int NewSortOrder { get; set; }
}
