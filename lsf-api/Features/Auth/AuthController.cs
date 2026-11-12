using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LsfApi.Features.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, PasswordService passwords, JwtService jwt, IWebHostEnvironment env) : ControllerBase
{
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var email = AuthCookie.NormalizeEmail(req.Email);
        var username = req.Username.Trim();

        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { error = "email_taken", message = "Cet email est déjà utilisé." });

        if (await db.Users.AnyAsync(u => u.Username == username))
            return Conflict(new { error = "username_taken", message = "Ce nom d'utilisateur est déjà pris." });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Username = username,
            PasswordHash = passwords.Hash(req.Password),
        };

        db.Users.Add(user);
        db.UserProgress.Add(new UserProgress { UserId = user.Id });
        await db.SaveChangesAsync();

        AuthCookie.Set(Response, jwt.Generate(user), env.IsDevelopment());
        return Ok(new AuthResponse(ToDto(user)));
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var email = AuthCookie.NormalizeEmail(req.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Hash vérifié même si le compte n'existe pas : temps de réponse identique (pas d'énumération des emails)
        var valid = passwords.Verify(req.Password, user?.PasswordHash ?? PasswordService.DummyHash);
        if (user is null || !valid)
            return Unauthorized(new { error = "invalid_credentials", message = "Email ou mot de passe incorrect." });

        AuthCookie.Set(Response, jwt.Generate(user), env.IsDevelopment());
        return Ok(new AuthResponse(ToDto(user)));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        AuthCookie.Delete(Response, env.IsDevelopment());
        return NoContent();
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

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(UpdateProfileRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await db.Users.FindAsync(userId);

        if (user is null) return NotFound();

        var email = AuthCookie.NormalizeEmail(req.Email);
        var username = req.Username.Trim();

        if (email != user.Email && await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { error = "email_taken", message = "Cet email est déjà utilisé." });

        if (username != user.Username && await db.Users.AnyAsync(u => u.Username == username))
            return Conflict(new { error = "username_taken", message = "Ce nom d'utilisateur est déjà pris." });

        user.Username = username;
        user.Email = email;

        await db.SaveChangesAsync();

        return Ok(ToDto(user));
    }

    private static UserDto ToDto(User u) => new(u.Id, u.Email, u.Username, u.Role, u.CreatedAt);
}
