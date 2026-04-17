using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Badges;

[ApiController]
[Route("api/badges")]
[Authorize]
public class BadgeController(BadgeService badgeService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMyBadges()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var badges = await badgeService.GetUserBadgesAsync(userId);
        return Ok(badges);
    }
}
