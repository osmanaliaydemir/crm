namespace CRM.Application.Helpdesk.DTOs;

public class TicketCommentDto
{
    public Guid Id { get; set; }
    public Guid TicketId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class TicketDto
{
    public Guid Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    
    public Guid? CustomerId { get; set; }
    public string? CustomerName { get; set; }
    
    public Guid? CreatedByUserId { get; set; }
    public string? CreatedByUserName { get; set; }
    
    public Guid? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public List<TicketCommentDto> Comments { get; set; } = new();
}

public class CreateTicketDto
{
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = "Normal";
    public Guid? CustomerId { get; set; }
}

public class UpdateTicketStatusDto
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class AssignTicketDto
{
    public Guid Id { get; set; }
    public Guid AssignedToId { get; set; }
}

public class CreateTicketCommentDto
{
    public Guid TicketId { get; set; }
    public string Content { get; set; } = string.Empty;
}
