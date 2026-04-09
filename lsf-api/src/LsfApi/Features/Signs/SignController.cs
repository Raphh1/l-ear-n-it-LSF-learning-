using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Signs;

[ApiController]
[Route("api/signs")]
public class SignController(SignService signService, ElixService elixService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] SignsQueryParams query)
    {
        var result = await signService.GetAllAsync(query);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await signService.GetBySlugAsync(slug);
        return result.IsSuccess ? Ok(result.Value) : NotFound();
    }

    [HttpGet("elix")]
    public async Task<IActionResult> GetVideos([FromQuery] string word)
    {
        var result = await elixService.GetVideosAsync(word);
        return Ok(result ?? new ElixWordResultDto(word, null, []));
    }
}
