using System.ComponentModel.DataAnnotations;

namespace LsfApi.Features.Auth;

public record RegisterRequest(
    [Required, EmailAddress] string Email,
    [Required, MinLength(3)] string Username,
    [Required, MinLength(8)] string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record AuthResponse(string Token, UserDto User);

public record UserDto(Guid Id, string Email, string Username, string Role);
