namespace CRM.Application.Calendar.DTOs;

public class EventAttendeeDto
{
    public Guid Id { get; set; }
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // Bekliyor, Katılacak vb.
}

public class EventDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Location { get; set; }
    
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    
    public List<EventAttendeeDto> Attendees { get; set; } = new();
}

public class CreateEventDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Type { get; set; } = "Toplantı";
    public string? Location { get; set; }
}

public class UpdateEventDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Type { get; set; } = string.Empty;
    public string? Location { get; set; }
}

public class AddAttendeeDto
{
    public Guid EventId { get; set; }
    public Guid UserId { get; set; }
}

public class UpdateAttendeeStatusDto
{
    public Guid Id { get; set; } // Attendee Id
    public string Status { get; set; } = string.Empty;
}
