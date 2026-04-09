using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LsfApi.Features.Progress;

[ApiController]
[Route("api/progress")]
[Authorize]
public class ProgressController(ProgressService progressService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProgress()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await progressService.GetProgressAsync(userId);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("lessons/{lessonId:guid}/complete")]
    public async Task<IActionResult> CompleteLesson(Guid lessonId, CompleteLessonRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await progressService.CompleteLessonAsync(userId, lessonId, req.Score, req.Total);
        return result is null ? NotFound() : Ok(result);
    }
}
