using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Revision;

public class RevisionService(AppDbContext db)
{
    // SM-2 algorithm: q=4 (correct), q=1 (wrong)
    private static void ApplySm2(UserSignStat stat, bool isCorrect)
    {
        int q = isCorrect ? 4 : 1;

        if (q >= 3)
        {
            stat.SrsInterval = stat.SrsRepetitions switch
            {
                0 => 1,
                1 => 6,
                _ => (int)Math.Round(stat.SrsInterval * stat.SrsEaseFactor)
            };
            stat.SrsRepetitions++;
            stat.SrsEaseFactor += 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
            if (stat.SrsEaseFactor < 1.3) stat.SrsEaseFactor = 1.3;
        }
        else
        {
            stat.SrsRepetitions = 0;
            stat.SrsInterval = 1;
        }

        stat.NextReviewAt = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(stat.SrsInterval);
    }

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
            ApplySm2(stat, attempt.IsCorrect);
        }

        await db.SaveChangesAsync();
    }

    public async Task<List<RevisionSignDto>> GetDueSignsAsync(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Signes planifiés et dus + signes jamais planifiés (pratiqués avant le SRS)
        var stats = await db.UserSignStats
            .Where(s => s.UserId == userId &&
                (s.NextReviewAt == null || s.NextReviewAt <= today))
            .Include(s => s.Sign)
            .OrderBy(s => s.NextReviewAt == null ? 0 : 1) // non planifiés en premier
            .ThenBy(s => s.NextReviewAt)
            .Take(20)
            .ToListAsync();

        return stats.Select(s => new RevisionSignDto(
            s.Sign.Id,
            s.Sign.Word,
            s.Sign.Slug,
            s.Sign.ThumbnailUrl,
            s.Sign.VideoUrl,
            s.Sign.GifUrl,
            s.WrongCount,
            s.CorrectCount,
            s.NextReviewAt,
            s.SrsInterval
        )).ToList();
    }

    public async Task<SignStatDto?> GetSignStatAsync(Guid userId, Guid signId)
    {
        var stat = await db.UserSignStats
            .FirstOrDefaultAsync(s => s.UserId == userId && s.SignId == signId);

        if (stat is null) return null;

        return new SignStatDto(
            stat.CorrectCount,
            stat.WrongCount,
            stat.LastAttemptAt,
            stat.SrsInterval,
            stat.NextReviewAt
        );
    }

    public async Task<GlobalStatsDto> GetGlobalStatsAsync(Guid userId)
    {
        var stats = await db.UserSignStats
            .Where(s => s.UserId == userId)
            .Include(s => s.Sign)
            .ToListAsync();

        if (stats.Count == 0)
            return new GlobalStatsDto(0, 0, 0, 0, null, null, null, null, null, 0);

        var totalCorrect = stats.Sum(s => s.CorrectCount);
        var totalWrong = stats.Sum(s => s.WrongCount);
        var total = totalCorrect + totalWrong;
        var successRate = total == 0 ? 0 : Math.Round((double)totalCorrect / total * 100, 1);

        var best = stats
            .Where(s => s.CorrectCount + s.WrongCount > 0)
            .OrderByDescending(s => (double)s.CorrectCount / (s.CorrectCount + s.WrongCount))
            .FirstOrDefault();

        var hardest = stats
            .Where(s => s.WrongCount > 0)
            .OrderByDescending(s => (double)s.WrongCount / (s.CorrectCount + s.WrongCount))
            .FirstOrDefault();

        var lastPractice = stats.Max(s => s.LastAttemptAt);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dueCount = stats.Count(s => s.NextReviewAt != null && s.NextReviewAt <= today);

        return new GlobalStatsDto(
            stats.Count,
            totalCorrect,
            totalWrong,
            successRate,
            best?.Sign.Word,
            best?.Sign.Slug,
            hardest?.Sign.Word,
            hardest?.Sign.Slug,
            lastPractice,
            dueCount
        );
    }

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
                s.CorrectCount,
                s.NextReviewAt,
                s.SrsInterval
            ))
            .ToList();
    }
}
