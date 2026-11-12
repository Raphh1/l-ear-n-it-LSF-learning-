namespace LsfApi.Features.Auth;

public class DeleteAccountRequestDto
{
    [System.ComponentModel.DataAnnotations.MaxLength(AuthLimits.PasswordMax)]
    public string Password { get; set; } = string.Empty;
    public bool? ExportDataFirst { get; set; } = false;
}

public class DeleteAccountResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ExportedData { get; set; }
}

public class AccountDeletionConfirmationDto
{
    public bool ConfirmDeletion { get; set; }
    public string Reason { get; set; } = string.Empty;
}
