namespace LsfApi.Features.Auth;

public class PasswordService
{
    // Hash factice (même coût que les vrais) pour vérifier un mot de passe quand le compte n'existe pas
    public static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword("dummy-password-for-timing", workFactor: 12);

    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

    public bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);
}
