using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CRM.Application.Common.Interfaces;
using CRM.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(IApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (user == null || user.PasswordHash != HashPassword(request.Password))
        {
            return Unauthorized(new { message = "E-posta veya şifre hatalı." });
        }

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString(), // Placeholder
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                Avatar = user.Avatar,
                CustomerId = user.CustomerId
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Bu e-posta adresi zaten kullanılıyor." });
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = $"{request.FirstName} {request.LastName}".Trim(),
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            Role = "employee", // Varsayılan rol
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(default);

        return Ok(new { message = "Kayıt başarılı." });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Avatar = user.Avatar,
            CustomerId = user.CustomerId
        });
    }

    [Authorize(Policy = "EmployeeAccess")]
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users
            .AsNoTracking()
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Role = u.Role,
                Avatar = u.Avatar,
                CustomerId = u.CustomerId
            })
            .ToListAsync();

        return Ok(users);
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Stateless JWT modunda client-side token silinmesi yeterlidir.
        // Burada loglama veya token geçersiz kılma (blacklist) işlemleri yapılabilir.
        return Ok(new { message = "Oturum başarıyla sonlandırıldı." });
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "FallbackSecretKey12345678901234567890";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("role", user.Role)
        }.ToList();

        if (user.CustomerId.HasValue)
        {
            claims.Add(new Claim("customer_id", user.CustomerId.ToString()!));
        }

        int expiryMinutes = int.TryParse(jwtSettings["ExpiryMinutes"], out var parsed) ? parsed : 1440;

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Department { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public Guid? CustomerId { get; set; }
}
