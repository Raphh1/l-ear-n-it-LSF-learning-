using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LsfApi.Features.Favorites;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController(FavoritesService favoritesService) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await favoritesService.GetAllAsync(UserId);
        return Ok(result);
    }

    [HttpPost("{signId:guid}")]
    public async Task<IActionResult> Add(Guid signId)
    {
        await favoritesService.AddAsync(UserId, signId);
        return NoContent();
    }

    [HttpDelete("{signId:guid}")]
    public async Task<IActionResult> Remove(Guid signId)
    {
        await favoritesService.RemoveAsync(UserId, signId);
        return NoContent();
    }

    [HttpGet("ids")]
    public async Task<IActionResult> GetIds()
    {
        var ids = await favoritesService.GetIdsAsync(UserId);
        return Ok(ids);
    }
}
