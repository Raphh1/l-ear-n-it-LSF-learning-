using System.ComponentModel.DataAnnotations;

namespace LsfApi.Features.Auth;

public class RequestPasswordResetDto
{
    [Required, EmailAddress, MaxLength(AuthLimits.EmailMax)]
    public string Email { get; set; } = string.Empty;
}

public class VerifyPasswordResetTokenDto
{
    [Required, EmailAddress, MaxLength(AuthLimits.EmailMax)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Token { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required, EmailAddress, MaxLength(AuthLimits.EmailMax)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Token { get; set; } = string.Empty;

    [Required, MinLength(AuthLimits.PasswordMin), MaxLength(AuthLimits.PasswordMax)]
    public string NewPassword { get; set; } = string.Empty;

    [Required, MinLength(AuthLimits.PasswordMin), MaxLength(AuthLimits.PasswordMax)]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class PasswordResetResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}
