using LsfApi.Domain;
using LsfApi.Features.Auth;
using LsfApi.Tests.Helpers;
using Microsoft.Extensions.Logging.Abstractions;

namespace LsfApi.Tests.Auth;

public class PasswordResetServiceTests
{
    private static (PasswordResetService svc, FakeEmailService email, LsfApi.Data.AppDbContext db, User user) Setup()
    {
        var db = DbHelper.CreateDb();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            Username = "testuser",
            PasswordHash = new PasswordService().Hash("oldpassword"),
        };
        db.Users.Add(user);
        db.SaveChanges();

        var email = new FakeEmailService();
        var svc = new PasswordResetService(db, new PasswordService(), email, NullLogger<PasswordResetService>.Instance);
        return (svc, email, db, user);
    }

    // ── RequestPasswordReset ─────────────────────────────────────────────────

    [Fact]
    public async Task Request_KnownEmail_CreatesTokenAndReturnsTrue()
    {
        var (svc, _, db, user) = Setup();

        var result = await svc.RequestPasswordResetAsync(user.Email);

        Assert.True(result);
        Assert.Single(db.PasswordResetTokens.Where(t => t.UserId == user.Id));
    }

    [Fact]
    public async Task Request_UnknownEmail_ReturnsTrueWithoutCreatingToken()
    {
        var (svc, _, db, _) = Setup();

        var result = await svc.RequestPasswordResetAsync("nobody@example.com");

        Assert.True(result); // don't reveal existence
        Assert.Empty(db.PasswordResetTokens);
    }

    [Fact]
    public async Task Request_SecondRequest_InvalidatesOldToken()
    {
        var (svc, _, db, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);
        await svc.RequestPasswordResetAsync(user.Email);

        Assert.Single(db.PasswordResetTokens.Where(t => t.UserId == user.Id && !t.IsUsed));
    }

    // ── VerifyPasswordResetToken ─────────────────────────────────────────────

    [Fact]
    public async Task Verify_ValidToken_ReturnsTrue()
    {
        var (svc, email, _, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);
        var rawToken = email.ResetRequests[0].Token;

        var result = await svc.VerifyPasswordResetTokenAsync(user.Email, rawToken);

        Assert.True(result);
    }

    [Fact]
    public async Task Verify_WrongToken_ReturnsFalse()
    {
        var (svc, _, _, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);

        var result = await svc.VerifyPasswordResetTokenAsync(user.Email, "badtoken");

        Assert.False(result);
    }

    [Fact]
    public async Task Verify_ExpiredToken_ReturnsFalse()
    {
        var (svc, email, db, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);

        // Force expiry
        var token = db.PasswordResetTokens.Single(t => t.UserId == user.Id);
        token.ExpiresAt = DateTime.UtcNow.AddHours(-1);
        db.SaveChanges();

        var result = await svc.VerifyPasswordResetTokenAsync(user.Email, email.ResetRequests[0].Token);

        Assert.False(result);
    }

    // ── ResetPassword ────────────────────────────────────────────────────────

    [Fact]
    public async Task Reset_ValidToken_UpdatesPasswordAndMarksUsed()
    {
        var (svc, email, db, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);
        var rawToken = email.ResetRequests[0].Token;

        var (success, _) = await svc.ResetPasswordAsync(user.Email, rawToken, "newpassword123");

        Assert.True(success);
        var passwords = new PasswordService();
        var updatedUser = db.Users.Find(user.Id)!;
        Assert.True(passwords.Verify("newpassword123", updatedUser.PasswordHash));
        Assert.True(db.PasswordResetTokens.Single(t => t.UserId == user.Id).IsUsed);
    }

    [Fact]
    public async Task Reset_InvalidToken_ReturnsFalse()
    {
        var (svc, _, _, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);

        var (success, msg) = await svc.ResetPasswordAsync(user.Email, "badtoken", "newpassword123");

        Assert.False(success);
        Assert.Contains("invalide", msg);
    }

    [Fact]
    public async Task Reset_PasswordTooShort_ReturnsFalse()
    {
        var (svc, email, _, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);
        var rawToken = email.ResetRequests[0].Token;

        var (success, msg) = await svc.ResetPasswordAsync(user.Email, rawToken, "short");

        Assert.False(success);
        Assert.Contains("8", msg);
    }

    [Fact]
    public async Task Reset_AlreadyUsedToken_ReturnsFalse()
    {
        var (svc, email, _, user) = Setup();
        await svc.RequestPasswordResetAsync(user.Email);
        var rawToken = email.ResetRequests[0].Token;

        await svc.ResetPasswordAsync(user.Email, rawToken, "newpassword123");
        var (success, _) = await svc.ResetPasswordAsync(user.Email, rawToken, "anotherpassword");

        Assert.False(success);
    }
}
