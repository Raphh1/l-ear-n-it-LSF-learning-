namespace LsfApi.Features.Auth;

// Cookie de session httpOnly : mêmes options à la création et à la suppression,
// sinon le navigateur peut garder l'ancien cookie
public static class AuthCookie
{
    public const string Name = "lsf_token";

    public static void Set(HttpResponse response, string token, bool isDevelopment)
    {
        var options = Options(isDevelopment);
        options.Expires = DateTimeOffset.UtcNow.AddDays(7);
        response.Cookies.Append(Name, token, options);
    }

    public static void Delete(HttpResponse response, bool isDevelopment) =>
        response.Cookies.Delete(Name, Options(isDevelopment));

    private static CookieOptions Options(bool isDevelopment) => new()
    {
        HttpOnly = true,
        Secure = !isDevelopment,  // Secure uniquement en prod (HTTPS)
        SameSite = SameSiteMode.Lax,
        Path = "/",
    };

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
