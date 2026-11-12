using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Quests;

[ApiController]
[Route("api/quests")]
[Authorize]
public class DailyQuestController(DailyQuestService questService) : ControllerBase
{
    [HttpGet("today")]
    public async Task<IActionResult> GetTodayQuests()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var quests = await questService.GetOrCreateTodayQuestsAsync(userId);
        return Ok(quests);
    }
}
