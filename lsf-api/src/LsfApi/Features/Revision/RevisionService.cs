using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Revision;

public class RevisionService(AppDbContext db)
{
    /// <summary>
    /// Enregistre les tentatives par signe (upsert).
    /// </summary>
    public async Task SubmitAttemptsAsync(Guid userId, List<SignAttemptDto> attempts)
    {
        foreach (var attempt in attempts)
        {
            var stat = await db.UserSignStats
                .FirstOrDefaultAsync(s => s.UserId == userId && s.SignId == attempt.SignId);

            if (stat is null)
            {
                stat = new UserSignStat { UserId = userId, SignId = attempt.SignId };
                db.UserSignStats.Add(stat);
            }

            if (attempt.IsCorrect) stat.CorrectCount++;
            else stat.WrongCount++;

            stat.LastAttemptAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
    }

    /// <summary>
    /// Retourne les signes d'une leçon sur lesquels l'utilisateur a fait des erreurs,
    /// triés par taux d'erreur décroissant (les plus difficiles en premier).
    /// </summary>
    public async Task<List<RevisionSignDto>> GetRevisionSignsAsync(Guid userId, Guid lessonId)
    {
        var lessonSignIds = await db.LessonSigns
            .Where(ls => ls.LessonId == lessonId)
            .Select(ls => ls.SignId)
            .ToListAsync();

        var stats = await db.UserSignStats
            .Where(s => s.UserId == userId && lessonSignIds.Contains(s.SignId) && s.WrongCount > 0)
            .Include(s => s.Sign)
            .ToListAsync();

        return stats
            .OrderByDescending(s => (double)s.WrongCount / (s.WrongCount + s.CorrectCount + 1))
            .Select(s => new RevisionSignDto(
                s.Sign.Id,
                s.Sign.Word,
                s.Sign.Slug,
                s.Sign.ThumbnailUrl,
                s.Sign.VideoUrl,
                s.Sign.GifUrl,
                s.WrongCount,
                s.CorrectCount
            ))
            .ToList();
    }
}
