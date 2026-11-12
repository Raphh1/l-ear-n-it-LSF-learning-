using LsfApi.Data;
using LsfApi.Domain;
using LsfApi.Features.Email;
using System.Security.Cryptography;

namespace LsfApi.Features.Auth;

public class PasswordResetService(
    AppDbContext context,
    PasswordService passwordService,
    IEmailService emailService,
    ILogger<PasswordResetService> logger)
{
    public async Task<bool> RequestPasswordResetAsync(string email)
    {
        try
        {
            var normalized = AuthCookie.NormalizeEmail(email);
            var user = context.Users.FirstOrDefault(u => u.Email == normalized);
            if (user == null)
            {
                // Ne pas révéler si l'email existe
                return true;
            }

            var rawToken = GenerateSecureToken();
            var tokenHash = HashToken(rawToken);
            var expiresAt = DateTime.UtcNow.AddHours(24);

            var oldTokens = context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.IsUsed)
                .ToList();
            context.PasswordResetTokens.RemoveRange(oldTokens);

            context.PasswordResetTokens.Add(new PasswordResetToken
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = tokenHash,   // on stocke le hash, jamais le token brut
                ExpiresAt = expiresAt,
                IsUsed = false
            });
            await context.SaveChangesAsync();

            _ = emailService.SendPasswordResetEmailAsync(user.Email, user.Username, rawToken);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error requesting password reset");
            return false;
        }
    }

    public async Task<bool> VerifyPasswordResetTokenAsync(string email, string rawToken)
    {
        try
        {
            var normalized = AuthCookie.NormalizeEmail(email);
            var user = context.Users.FirstOrDefault(u => u.Email == normalized);
            if (user == null) return false;

            var tokenHash = HashToken(rawToken);
            var resetToken = context.PasswordResetTokens
                .FirstOrDefault(t =>
                    t.UserId == user.Id &&
                    t.Token == tokenHash &&
                    !t.IsUsed &&
                    t.ExpiresAt > DateTime.UtcNow);

            return resetToken != null;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error verifying password reset token");
            return false;
        }
    }

    public async Task<(bool Success, string Message)> ResetPasswordAsync(string email, string rawToken, string newPassword)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 8)
                return (false, "Le mot de passe doit contenir au moins 8 caractères");

            var normalized = AuthCookie.NormalizeEmail(email);
            var user = context.Users.FirstOrDefault(u => u.Email == normalized);
            if (user == null)
                return (false, "Token invalide ou expiré");   // même message : ne révèle pas si le compte existe

            var tokenHash = HashToken(rawToken);
            var resetToken = context.PasswordResetTokens
                .FirstOrDefault(t =>
                    t.UserId == user.Id &&
                    t.Token == tokenHash &&
                    !t.IsUsed &&
                    t.ExpiresAt > DateTime.UtcNow);

            if (resetToken == null)
                return (false, "Token invalide ou expiré");

            user.PasswordHash = passwordService.Hash(newPassword);
            user.TokenVersion++;   // déconnecte toutes les sessions ouvertes
            resetToken.IsUsed = true;

            var otherTokens = context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.IsUsed && t.Id != resetToken.Id)
                .ToList();
            context.PasswordResetTokens.RemoveRange(otherTokens);

            await context.SaveChangesAsync();

            logger.LogInformation("Password reset successful for user {UserId}", user.Id);
            return (true, "Mot de passe réinitialisé avec succès");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error resetting password");
            return (false, "Erreur lors de la réinitialisation du mot de passe");
        }
    }

    private static string GenerateSecureToken()
    {
        var bytes = new byte[32];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    // Stocke un hash SHA256 du token — si la DB est compromise, les tokens bruts restent secrets
    private static string HashToken(string rawToken)
    {
        var bytes = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
