using LsfApi.Features.Email;

namespace LsfApi.Tests.Auth;

public class FakeEmailService : IEmailService
{
    public List<(string Email, string Token)> ResetRequests { get; } = [];

    public Task<bool> SendPasswordResetEmailAsync(string toEmail, string userName, string token)
    {
        ResetRequests.Add((toEmail, token));
        return Task.FromResult(true);
    }

    public Task<bool> SendAccountDeletionConfirmationAsync(string toEmail, string userName) => Task.FromResult(true);
    public Task<bool> SendWelcomeEmailAsync(string toEmail, string userName) => Task.FromResult(true);
    public Task<bool> SendRemindEmailAsync(string toEmail, string userName, int daysInactive) => Task.FromResult(true);
}
