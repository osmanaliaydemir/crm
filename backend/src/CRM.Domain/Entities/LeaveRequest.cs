using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class LeaveRequest : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public string Type { get; set; } = string.Empty; // Yıllık İzin, Mazeret İzni, Hastalık vb.
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Bekliyor"; // Bekliyor, Onaylandı, Reddedildi
    public Guid? ApprovedById { get; set; }
    public User? ApprovedBy { get; set; }
}
