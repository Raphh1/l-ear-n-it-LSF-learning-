namespace LsfApi.Features.Email;

public interface IEmailService
{
    Task<bool> SendPasswordResetEmailAsync(string toEmail, string userName, string token);
    Task<bool> SendAccountDeletionConfirmationAsync(string toEmail, string userName);
    Task<bool> SendWelcomeEmailAsync(string toEmail, string userName);
    Task<bool> SendRemindEmailAsync(string toEmail, string userName, int daysInactive);
}
