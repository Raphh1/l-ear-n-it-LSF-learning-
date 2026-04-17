using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LsfApi.Domain;
using Microsoft.IdentityModel.Tokens;

namespace LsfApi.Features.Auth;

public class JwtService(IConfiguration config)
{
    public string Generate(User user)
    {
        var secret = config["Jwt:Secret"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("username", user.Username),
        };

        var expiresDays = int.Parse(config["Jwt:ExpiresInDays"] ?? "7");

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiresDays),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
