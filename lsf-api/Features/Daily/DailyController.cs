using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Daily;

[ApiController]
[Route("api/daily")]
public class DailyController(DailyService dailyService) : ControllerBase
{
    /// <summary>
    /// Retourne le défi du jour. Accessible sans connexion (userId = null).
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetToday()
    {
        Guid? userId = null;
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (claim is not null) userId = Guid.Parse(claim);

        var challenge = await dailyService.GetTodayChallengeAsync(userId);
        return challenge is null ? NotFound() : Ok(challenge);
    }

    /// <summary>
    /// Soumet la réponse au défi du jour. Nécessite d'être connecté.
    /// </summary>
    [HttpPost("submit")]
    [Authorize]
    public async Task<IActionResult> Submit([FromBody] SubmitDailyRequest req)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await dailyService.SubmitAsync(userId, req.ChosenWord);
        return result is null ? Conflict(new { message = "Déjà joué aujourd'hui." }) : Ok(result);
    }
}
