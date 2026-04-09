using LsfApi.Common;
using LsfApi.Data;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Lessons;

public class LessonService(AppDbContext db)
{
    public async Task<Result<LessonDetailDto>> GetByIdAsync(Guid id)
    {
        var lesson = await db.Lessons
            .Where(l => l.IsPublished && l.Id == id)
            .Select(l => new LessonDetailDto(
                l.Id,
                l.ModuleId,
                l.Title,
                l.Description,
                l.SortOrder,
                l.XpReward,
                l.LessonSigns
                    .OrderBy(ls => ls.SortOrder)
                    .Select(ls => new SignInLessonDto(
                        ls.Sign!.Id,
                        ls.Sign.Word,
                        ls.Sign.Slug,
                        ls.Sign.ThumbnailUrl,
                        ls.Sign.VideoUrl,
                        ls.Sign.GifUrl,
                        ls.Sign.Difficulty
                    ))
            ))
            .FirstOrDefaultAsync();

        return lesson is null ? Result<LessonDetailDto>.Fail(Error.NotFound) : Result<LessonDetailDto>.Ok(lesson);
    }
}
