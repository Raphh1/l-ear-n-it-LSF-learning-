using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using LsfApi.Data;

namespace LsfApi.Features.Auth;

[ApiController]
[Route("api/[controller]")]
public class AccountController(
    AppDbContext db,
    PasswordResetService passwordResetService,
    AccountDeletionService accountDeletionService,
    PasswordService passwordService,
    JwtService jwt,
    IWebHostEnvironment env) : ControllerBase
{
    [HttpPost("password/change")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var user = await db.Users.FindAsync(userGuid);
        if (user is null)
            return NotFound(new { success = false, message = "Utilisateur introuvable" });

        if (!passwordService.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { success = false, message = "Mot de passe actuel invalide" });

        if (request.NewPassword != request.ConfirmPassword)
            return BadRequest(new { success = false, message = "Les mots de passe ne correspondent pas" });

        user.PasswordHash = passwordService.Hash(request.NewPassword);
        user.TokenVersion++;   // déconnecte toutes les autres sessions
        await db.SaveChangesAsync();

        // Nouveau cookie pour la session courante, sinon l'utilisateur serait déconnecté lui aussi
        AuthCookie.Set(Response, jwt.Generate(user), env.IsDevelopment());

        return Ok(new { success = true, message = "Mot de passe mis à jour" });
    }

    [HttpPost("password-reset/request")]
    [AllowAnonymous]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> RequestPasswordReset([FromBody] RequestPasswordResetDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email requis");

        await passwordResetService.RequestPasswordResetAsync(request.Email);

        return Ok(new
        {
            success = true,
            message = "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé"
        });
    }

    [HttpPost("password-reset/verify")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyPasswordResetToken([FromBody] VerifyPasswordResetTokenDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var isValid = await passwordResetService.VerifyPasswordResetTokenAsync(request.Email, request.Token);

        if (!isValid)
            return BadRequest(new PasswordResetResponseDto { Success = false, Message = "Token invalide ou expiré" });

        return Ok(new PasswordResetResponseDto { Success = true, Message = "Token valide" });
    }

    [HttpPost("password-reset/confirm")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (request.NewPassword != request.ConfirmPassword)
            return BadRequest(new PasswordResetResponseDto { Success = false, Message = "Les mots de passe ne correspondent pas" });

        var (success, message) = await passwordResetService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);

        return success
            ? Ok(new PasswordResetResponseDto { Success = true, Message = message })
            : BadRequest(new PasswordResetResponseDto { Success = false, Message = message });
    }

    [HttpGet("export-data")]
    [Authorize]
    public async Task<IActionResult> ExportUserData()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        var (success, jsonData, message) = await accountDeletionService.ExportUserDataAsync(userGuid);

        if (!success)
            return BadRequest(new { success, message });

        var bytes = System.Text.Encoding.UTF8.GetBytes(jsonData ?? "");
        return File(bytes, "application/json", $"learn-it-data-export-{DateTime.Now:yyyy-MM-dd}.json");
    }

    [HttpPost("delete")]
    [Authorize]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userId, out var userGuid))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new DeleteAccountResponseDto { Success = false, Message = "Mot de passe requis pour confirmer la suppression" });

        var user = await db.Users.FindAsync(userGuid);
        if (user is null)
            return NotFound(new DeleteAccountResponseDto { Success = false, Message = "Utilisateur introuvable" });

        if (!passwordService.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new DeleteAccountResponseDto { Success = false, Message = "Mot de passe invalide" });

        var exportedData = "";
        if (request.ExportDataFirst ?? false)
        {
            var (success, jsonData, _) = await accountDeletionService.ExportUserDataAsync(userGuid);
            if (success)
                exportedData = jsonData ?? "";
        }

        var (deleteSuccess, deleteMessage) = await accountDeletionService.DeleteAccountAsync(userGuid);

        if (!deleteSuccess)
            return BadRequest(new DeleteAccountResponseDto { Success = false, Message = deleteMessage });

        AuthCookie.Delete(Response, env.IsDevelopment());

        return Ok(new DeleteAccountResponseDto { Success = true, Message = deleteMessage, ExportedData = exportedData });
    }
}
