using LsfApi.Common;
using LsfApi.Data;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Phrases;

public class PhraseService(AppDbContext db)
{
    public async Task<Result<PhraseLessonDto>> GetByLessonIdAsync(Guid lessonId)
    {
        var lesson = await db.Lessons
            .Where(l => l.IsPublished && l.Id == lessonId && l.LessonType == "phrases")
            .Select(l => new PhraseLessonDto(
                l.Id,
                l.Title,
                l.XpReward,
                l.LessonPhrases
                    .OrderBy(lp => lp.SortOrder)
                    .Select(lp => new PhraseDto(
                        lp.Phrase.Id,
                        lp.Phrase.TextFr,
                        lp.Phrase.TextLsf,
                        lp.Phrase.VideoUrl,
                        lp.Phrase.PhraseSigns
                            .OrderBy(ps => ps.Position)
                            .Select(ps => new SignInPhraseDto(
                                ps.Sign.Id,
                                ps.Sign.Word,
                                ps.Sign.Slug,
                                ps.Sign.VideoUrl,
                                ps.Sign.GifUrl,
                                ps.Sign.ThumbnailUrl
                            ))
                    ))
            ))
            .FirstOrDefaultAsync();

        return lesson is null
            ? Result<PhraseLessonDto>.Fail(Error.NotFound)
            : Result<PhraseLessonDto>.Ok(lesson);
    }
}
