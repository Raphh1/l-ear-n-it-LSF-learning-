using LsfApi.Data;
using LsfApi.Domain;
using LsfApi.Features.Badges;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Daily;

public class DailyService(AppDbContext db, BadgeService badgeService)
{
    private const int XpCorrect = 10;
    private const int XpWrong = 2;

    /// <summary>
    /// Retourne le signe du jour (déterministe par date) + les 4 choix + statut de l'utilisateur.
    /// userId est null pour les visiteurs non connectés.
    /// </summary>
    public async Task<DailyChallenge?> GetTodayChallengeAsync(Guid? userId)
    {
        var signs = await db.Signs
            .Where(s => s.IsPublished)
            .OrderBy(s => s.Id)
            .ToListAsync();

        if (signs.Count == 0) return null;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var dayIndex = today.DayNumber;

        // Signe du jour — déterministe
        var todaySign = signs[dayIndex % signs.Count];

        // 3 leurres — déterministes (même seed = même leurres pour tout le monde)
        var rng = new Random(dayIndex);
        var decoys = signs
            .Where(s => s.Id != todaySign.Id)
            .OrderBy(_ => rng.Next())
            .Take(3)
            .Select(s => s.Word)
            .ToList();

        // Mélanger les 4 choix de façon déterministe
        var choices = decoys.Append(todaySign.Word)
            .OrderBy(_ => new Random(dayIndex + 1).Next())
            .ToList();

        // Statut utilisateur
        bool alreadyPlayed = false;
        bool? wasCorrect = null;

        if (userId.HasValue)
        {
            var attempt = await db.UserDailyAttempts
                .FirstOrDefaultAsync(a => a.UserId == userId.Value && a.Date == today);

            if (attempt is not null)
            {
                alreadyPlayed = true;
                wasCorrect = attempt.IsCorrect;
            }
        }

        return new DailyChallenge(
            Sign: new DailySignDto(
                todaySign.Id, todaySign.Word, todaySign.Slug,
                todaySign.ThumbnailUrl, todaySign.VideoUrl, todaySign.GifUrl
            ),
            Choices: choices,
            Date: today.ToString("yyyy-MM-dd"),
            AlreadyPlayed: alreadyPlayed,
            WasCorrect: wasCorrect
        );
    }

    /// <summary>
    /// Enregistre la réponse de l'utilisateur. Retourne null si déjà joué aujourd'hui.
    /// </summary>
    public async Task<SubmitDailyResponse?> SubmitAsync(Guid userId, string chosenWord)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Idempotent — une seule tentative par jour
        var existing = await db.UserDailyAttempts
            .FirstOrDefaultAsync(a => a.UserId == userId && a.Date == today);
        if (existing is not null) return null;

        // Signe du jour
        var signs = await db.Signs
            .Where(s => s.IsPublished)
            .OrderBy(s => s.Id)
            .ToListAsync();

        var todaySign = signs[today.DayNumber % signs.Count];
        var isCorrect = string.Equals(chosenWord, todaySign.Word, StringComparison.OrdinalIgnoreCase);
        var xpEarned = isCorrect ? XpCorrect : XpWrong;

        // Retrouver le signe choisi pour stocker la référence (null si leurre inconnu)
        var chosenSign = signs.FirstOrDefault(s =>
            string.Equals(s.Word, chosenWord, StringComparison.OrdinalIgnoreCase));

        // Enregistrer la tentative
        db.UserDailyAttempts.Add(new UserDailyAttempt
        {
            UserId = userId,
            Date = today,
            SignId = chosenSign?.Id ?? todaySign.Id,
            IsCorrect = isCorrect,
            AnsweredAt = DateTime.UtcNow,
        });

        // Attribuer les XP
        var progress = await db.UserProgress.FindAsync(userId);
        if (progress is not null)
        {
            progress.XpTotal += xpEarned;

            var todayDate = DateOnly.FromDateTime(DateTime.UtcNow);
            if (progress.LastActivity is null || progress.LastActivity < todayDate.AddDays(-1))
                progress.StreakDays = 1;
            else if (progress.LastActivity == todayDate.AddDays(-1))
                progress.StreakDays += 1;
            progress.LastActivity = todayDate;
        }

        await db.SaveChangesAsync();
        await badgeService.AwardEligibleBadgesAsync(userId);

        return new SubmitDailyResponse(
            IsCorrect: isCorrect,
            CorrectWord: todaySign.Word,
            XpEarned: xpEarned,
            NewXpTotal: progress?.XpTotal ?? 0
        );
    }
}
