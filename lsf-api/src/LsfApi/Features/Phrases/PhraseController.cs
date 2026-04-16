using Microsoft.AspNetCore.Mvc;

namespace LsfApi.Features.Phrases;

[ApiController]
[Route("api/phrases")]
public class PhraseController(PhraseService phraseService) : ControllerBase
{
    [HttpGet("lesson/{lessonId:guid}")]
    public async Task<IActionResult> GetByLesson(Guid lessonId)
    {
        var result = await phraseService.GetByLessonIdAsync(lessonId);
        return result.IsSuccess ? Ok(result.Value) : NotFound();
    }
}
