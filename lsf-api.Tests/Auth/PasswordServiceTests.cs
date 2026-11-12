using LsfApi.Features.Auth;

namespace LsfApi.Tests.Auth;

public class PasswordServiceTests
{
    private readonly PasswordService _svc = new();

    [Fact]
    public void Hash_ReturnsNonEmptyString()
    {
        var hash = _svc.Hash("password123");
        Assert.False(string.IsNullOrWhiteSpace(hash));
    }

    [Fact]
    public void Hash_TwoCallsSamePassword_ProduceDifferentHashes()
    {
        var h1 = _svc.Hash("password123");
        var h2 = _svc.Hash("password123");
        Assert.NotEqual(h1, h2); // bcrypt uses a random salt
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = _svc.Hash("secret");
        Assert.True(_svc.Verify("secret", hash));
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _svc.Hash("secret");
        Assert.False(_svc.Verify("wrong", hash));
    }

    [Fact]
    public void Verify_EmptyPassword_ReturnsFalse()
    {
        var hash = _svc.Hash("secret");
        Assert.False(_svc.Verify("", hash));
    }
}
