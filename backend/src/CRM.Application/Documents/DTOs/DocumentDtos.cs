namespace CRM.Application.Documents.DTOs;

public class DocumentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string Extension { get; set; } = string.Empty;
    public long SizeInBytes { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public Guid UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class UploadDocumentDto
{
    public string EntityType { get; set; } = string.Empty; // Customer, Project, vb.
    public Guid EntityId { get; set; }
    // Not: Dosya içeriği Multipart/form-data (IFormFile) ile alınacağı için Controller'da ele alınacak.
}
