using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Revision;

[ApiController]
[Route("api/revision")]
[Authorize]
public class RevisionController(RevisionService revisionService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> SubmitAttempts([FromBody] SubmitAttemptsRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await revisionService.SubmitAttemptsAsync(userId, req.Attempts);
        return Ok();
    }

    [HttpGet("lesson/{lessonId:guid}")]
    public async Task<IActionResult> GetRevisionSigns(Guid lessonId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var signs = await revisionService.GetRevisionSignsAsync(userId, lessonId);
        return Ok(signs);
    }
}
