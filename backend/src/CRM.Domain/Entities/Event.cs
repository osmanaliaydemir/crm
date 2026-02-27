using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Event : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public string Type { get; set; } = "Toplantı"; // Toplantı, Hatırlatıcı, Görev vb.
    public string? Location { get; set; }
    
    public Guid UserId { get; set; } // Etkinliği oluşturan/sahibi olan kullanıcı
    public User User { get; set; } = null!;
    
    public ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
}
