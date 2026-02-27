using CRM.Domain.Common;

namespace CRM.Domain.Entities;

public class Document : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty; // S3, Blob Storage veya Sunucu üzerindeki dizin
    public string Extension { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    
    public string EntityType { get; set; } = string.Empty; // "Customer", "Project", "Ticket" vb.
    public Guid EntityId { get; set; }
    
    public Guid UploadedByUserId { get; set; }
    public User UploadedByUser { get; set; } = null!;
}
