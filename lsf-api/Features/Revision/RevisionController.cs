using System.Security.Claims;
using LsfApi.Features.Quests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Revision;

[ApiController]
[Route("api/revision")]
[Authorize]
public class RevisionController(RevisionService revisionService, DailyQuestService questService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SubmitAttempts([FromBody] SubmitAttemptsRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await revisionService.SubmitAttemptsAsync(userId, req.Attempts);
        await questService.IncrementQuestAsync(userId, "review_signs", req.Attempts.Count);
        return Ok();
    }

    [HttpGet("due")]
    public async Task<IActionResult> GetDueSigns()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var signs = await revisionService.GetDueSignsAsync(userId);
        return Ok(signs);
    }

    [HttpGet("lesson/{lessonId:guid}")]
    public async Task<IActionResult> GetRevisionSigns(Guid lessonId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var signs = await revisionService.GetRevisionSignsAsync(userId, lessonId);
        return Ok(signs);
    }

    [HttpGet("stats/{signId:guid}")]
    public async Task<IActionResult> GetSignStat(Guid signId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var stat = await revisionService.GetSignStatAsync(userId, signId);
        if (stat is null) return NoContent();
        return Ok(stat);
    }

    [HttpGet("stats/global")]
    public async Task<IActionResult> GetGlobalStats()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var stats = await revisionService.GetGlobalStatsAsync(userId);
        return Ok(stats);
    }
}
