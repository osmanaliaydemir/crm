using CRM.Application.Documents.DTOs;

namespace CRM.Application.Documents.Interfaces;

public interface IDocumentService
{
    Task<IEnumerable<DocumentDto>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken cancellationToken);
    Task<DocumentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    
    // Not: stream ve contentType IFormFile olarak controller'da işlenip byte[] veya stream olarak buraya aktarılır.
    Task<DocumentDto> UploadAsync(UploadDocumentDto dto, Guid userId, string originalFileName, byte[] fileData, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, Guid currentUserId, CancellationToken cancellationToken);
    
    Task<(byte[] Data, string OriginalName, string ContentType)?> DownloadAsync(Guid id, CancellationToken cancellationToken);
}
