using CRM.Application.Documents.DTOs;
using CRM.Application.Documents.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly IValidator<UploadDocumentDto> _uploadValidator;

    public DocumentsController(IDocumentService documentService, IValidator<UploadDocumentDto> uploadValidator)
    {
        _documentService = documentService;
        _uploadValidator = uploadValidator;
    }

    [HttpGet("{entityType}/{entityId}")]
    public async Task<IActionResult> GetByEntity(string entityType, Guid entityId, CancellationToken cancellationToken)
    {
        var result = await _documentService.GetByEntityAsync(entityType, entityId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _documentService.GetByIdAsync(id, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("upload")]
    // [Consumes("multipart/form-data")] - Swagger tanır
    public async Task<IActionResult> Upload([FromForm] UploadDocumentDto dto, IFormFile file, CancellationToken cancellationToken)
    {
        var validationResult = await _uploadValidator.ValidateAsync(dto, cancellationToken);
        if (!validationResult.IsValid)
            return BadRequest(validationResult.Errors);

        if (file == null || file.Length == 0)
            return BadRequest("Dosya yüklenemedi veya boş.");

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        // Convert the file to byte array for the application layer
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        var fileData = memoryStream.ToArray();

        var result = await _documentService.UploadAsync(dto, userId, file.FileName, fileData, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var result = await _documentService.DownloadAsync(id, cancellationToken);
        if (result == null) return NotFound();

        return File(result.Value.Data, result.Value.ContentType, result.Value.OriginalName);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out Guid userId)) return Unauthorized();

        // Security check - Is it their own file or are they an admin?
        if (!User.IsInRole("admin"))
        {
            var doc = await _documentService.GetByIdAsync(id, cancellationToken);
            if (doc != null && doc.UploadedByUserId != userId)
            {
                return Forbid();
            }
        }

        var result = await _documentService.DeleteAsync(id, userId, cancellationToken);
        if (!result) return NotFound();

        return NoContent();
    }
}
