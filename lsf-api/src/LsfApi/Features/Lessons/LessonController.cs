using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Lessons;

[ApiController]
[Route("api/lessons")]
public class LessonController(LessonService lessonService) : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await lessonService.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : NotFound();
    }
}
