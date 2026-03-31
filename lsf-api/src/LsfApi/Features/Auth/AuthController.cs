using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LsfApi.Features.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, PasswordService passwords, JwtService jwt) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { error = "email_taken", message = "Cet email est déjà utilisé." });

        if (await db.Users.AnyAsync(u => u.Username == req.Username))
            return Conflict(new { error = "username_taken", message = "Ce nom d'utilisateur est déjà pris." });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = req.Email.ToLower(),
            Username = req.Username,
            PasswordHash = passwords.Hash(req.Password),
        };

        db.Users.Add(user);
        db.UserProgress.Add(new UserProgress { UserId = user.Id });
        await db.SaveChangesAsync();

        var token = jwt.Generate(user);
        return Ok(new AuthResponse(token, ToDto(user)));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.ToLower());

        if (user is null || !passwords.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { error = "invalid_credentials", message = "Email ou mot de passe incorrect." });

        var token = jwt.Generate(user);
        return Ok(new AuthResponse(token, ToDto(user)));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);

        if (user is null) return NotFound();

        return Ok(ToDto(user));
    }

    private static UserDto ToDto(User u) => new(u.Id, u.Email, u.Username, u.Role);
}
