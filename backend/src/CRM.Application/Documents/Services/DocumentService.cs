using CRM.Application.Common.Interfaces;
using CRM.Application.Documents.DTOs;
using CRM.Application.Documents.Interfaces;
using CRM.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CRM.Application.Documents.Services;

public class DocumentService : IDocumentService
{
    private readonly IApplicationDbContext _context;
    private readonly string _uploadDirectory = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

    public DocumentService(IApplicationDbContext context)
    {
        _context = context;
        if (!Directory.Exists(_uploadDirectory))
        {
            Directory.CreateDirectory(_uploadDirectory);
        }
    }

    public async Task<IEnumerable<DocumentDto>> GetByEntityAsync(string entityType, Guid entityId, CancellationToken cancellationToken)
    {
        var docs = await _context.Documents
            .Include(d => d.UploadedByUser)
            .AsNoTracking()
            .Where(d => d.EntityType == entityType && d.EntityId == entityId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(cancellationToken);

        return docs.Select(MapToDto);
    }

    public async Task<DocumentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _context.Documents
            .Include(d => d.UploadedByUser)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == id, cancellationToken);

        return entity != null ? MapToDto(entity) : null;
    }

    // Gerçek dosya stream işlemleri Controller tarafında Multipart ile handle edilip byte[] alınır
    public async Task<DocumentDto> UploadAsync(UploadDocumentDto dto, Guid userId, string originalFileName, byte[] fileData, CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(originalFileName);
        var newFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_uploadDirectory, newFileName);

        // Fiziksel olarak yaz
        await File.WriteAllBytesAsync(filePath, fileData, cancellationToken);

        var entity = new Document
        {
            FileName = newFileName,
            OriginalFileName = originalFileName,
            FilePath = filePath,
            Extension = extension,
            SizeInBytes = fileData.Length,
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            UploadedByUserId = userId
        };

        _context.Documents.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var created = await _context.Documents
            .Include(d => d.UploadedByUser)
            .FirstAsync(d => d.Id == entity.Id, cancellationToken);

        return MapToDto(created);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid currentUserId, CancellationToken cancellationToken)
    {
        var entity = await _context.Documents.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null) return false;

        // Yetki kontrolü Controller'a bırakılabilir ama kendi belgesini silebilmeli
        // Yada admin silebilmeli

        _context.Documents.Remove(entity); // Soft delete the DB record
        await _context.SaveChangesAsync(cancellationToken);

        // Not: Gerçek fiziksel silme (File.Delete) isteniyorsa buraya eklenebilir, fakat Soft Delete olduğu için silinmemesi tavsiye edilir.

        return true;
    }

    public async Task<(byte[] Data, string OriginalName, string ContentType)?> DownloadAsync(Guid id, CancellationToken cancellationToken)
    {
        var entity = await _context.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id, cancellationToken);
        if (entity == null) return null;

        if (!File.Exists(entity.FilePath)) return null;

        var fileBytes = await File.ReadAllBytesAsync(entity.FilePath, cancellationToken);
        
        string contentType = "application/octet-stream"; // Varsayılan tip. (İleride MIME tespiti eklenebilir)

        return (fileBytes, entity.OriginalFileName, contentType);
    }

    private static DocumentDto MapToDto(Document d) => new()
    {
        Id = d.Id,
        FileName = d.FileName,
        OriginalFileName = d.OriginalFileName,
        Extension = d.Extension,
        SizeInBytes = d.SizeInBytes,
        EntityType = d.EntityType,
        EntityId = d.EntityId,
        UploadedByUserId = d.UploadedByUserId,
        UploadedByUserName = d.UploadedByUser?.Name ?? string.Empty,
        CreatedAt = d.CreatedAt
    };
}
