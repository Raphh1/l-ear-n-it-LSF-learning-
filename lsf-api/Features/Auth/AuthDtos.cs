using System.ComponentModel.DataAnnotations;

namespace LsfApi.Features.Auth;

// Bornes communes : bcrypt ignore tout ce qui dépasse 72 octets, d'où le max du mot de passe
public static class AuthLimits
{
    public const int EmailMax = 254;
    public const int UsernameMin = 3;
    public const int UsernameMax = 30;
    public const int PasswordMin = 8;
    public const int PasswordMax = 72;
    // Lettres (accents compris), chiffres, point, tiret, underscore
    public const string UsernamePattern = @"^[\p{L}\p{N}._-]+$";
}

public record RegisterRequest(
    [Required, EmailAddress, MaxLength(AuthLimits.EmailMax)] string Email,
    [Required, MinLength(AuthLimits.UsernameMin), MaxLength(AuthLimits.UsernameMax), RegularExpression(AuthLimits.UsernamePattern)] string Username,
    [Required, MinLength(AuthLimits.PasswordMin), MaxLength(AuthLimits.PasswordMax)] string Password
);

public record LoginRequest(
    [Required, EmailAddress, MaxLength(AuthLimits.EmailMax)] string Email,
    [Required, MaxLength(AuthLimits.PasswordMax)] string Password
);

public record AuthResponse(UserDto User);

public record UserDto(Guid Id, string Email, string Username, string Role, DateTime CreatedAt);

public record UpdateProfileRequest(
    [Required, MinLength(AuthLimits.UsernameMin), MaxLength(AuthLimits.UsernameMax), RegularExpression(AuthLimits.UsernamePattern)] string Username,
    [Required, EmailAddress, MaxLength(AuthLimits.EmailMax)] string Email
);

public record ChangePasswordRequest(
    [Required, MaxLength(AuthLimits.PasswordMax)] string CurrentPassword,
    [Required, MinLength(AuthLimits.PasswordMin), MaxLength(AuthLimits.PasswordMax)] string NewPassword,
    [Required, MinLength(AuthLimits.PasswordMin), MaxLength(AuthLimits.PasswordMax)] string ConfirmPassword
);
