using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Scores;

[ApiController]
[Route("api/scores")]
public class ScoreController(ScoreService scoreService) : ControllerBase
{
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Submit([FromBody] SubmitScoreRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await scoreService.SubmitAsync(userId, req.GameType, req.LessonId, req.Score);
        return Ok();
    }

    [HttpGet("leaderboard/global")]
    public async Task<IActionResult> GetGlobalLeaderboard()
    {
        var entries = await scoreService.GetGlobalLeaderboardAsync();
        return Ok(entries);
    }

    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard([FromQuery] string game, [FromQuery] Guid lessonId)
    {
        var entries = await scoreService.GetLeaderboardAsync(game, lessonId);
        return Ok(entries);
    }

    [HttpGet("me/best")]
    [Authorize]
    public async Task<IActionResult> GetMyBest([FromQuery] string game, [FromQuery] Guid lessonId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var best = await scoreService.GetUserBestScoreAsync(userId, game, lessonId);
        return Ok(new { best });
    }
}
