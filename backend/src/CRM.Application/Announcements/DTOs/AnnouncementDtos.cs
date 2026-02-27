namespace CRM.Application.Announcements.DTOs;

public class AnnouncementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public Guid PublishedById { get; set; }
    public string PublishedByNames { get; set; } = string.Empty;
}

public class CreateAnnouncementDto
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Type { get; set; } = "Genel";
    public bool IsActive { get; set; } = true;
}

public class UpdateAnnouncementDto : CreateAnnouncementDto
{
    public Guid Id { get; set; }
}
