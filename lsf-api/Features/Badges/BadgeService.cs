using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Badges;

public class BadgeService(AppDbContext db)
{
    public async Task<List<BadgeDto>> GetUserBadgesAsync(Guid userId)
    {
        var allBadges = await db.Badges.ToListAsync();
        var earned = await db.UserBadges
            .Where(ub => ub.UserId == userId)
            .ToDictionaryAsync(ub => ub.BadgeId, ub => ub.EarnedAt);

        return allBadges
            .Select(b => new BadgeDto(
                b.Id, b.Slug, b.Title, b.Description, b.Icon,
                earned.ContainsKey(b.Id),
                earned.TryGetValue(b.Id, out var at) ? at : null
            ))
            .ToList();
    }

    /// <summary>
    /// Vérifie et attribue tous les badges débloqués par cet utilisateur.
    /// À appeler après chaque action significative (complétion leçon, score, etc.)
    /// </summary>
    public async Task AwardEligibleBadgesAsync(Guid userId)
    {
        var allBadges = await db.Badges.ToListAsync();
        var alreadyEarnedList = await db.UserBadges
            .Where(ub => ub.UserId == userId)
            .Select(ub => ub.BadgeId)
            .ToListAsync();
        var alreadyEarned = alreadyEarnedList.ToHashSet();

        var progress = await db.UserProgress.FindAsync(userId);
        var completedCount = progress?.LessonsCompleted ?? 0;
        var xpTotal = progress?.XpTotal ?? 0;
        var streakDays = progress?.StreakDays ?? 0;

        var bestSurvie = await db.GameScores
            .Where(gs => gs.UserId == userId && gs.GameType == "survie")
            .Select(gs => (int?)gs.Score)
            .MaxAsync() ?? 0;

        var hasPerfect = await db.GameScores
            .AnyAsync(gs => gs.UserId == userId
                && (gs.GameType == "quiz" || gs.GameType == "inverse")
                && gs.Score == 100);

        foreach (var badge in allBadges)
        {
            if (alreadyEarned.Contains(badge.Id)) continue;

            var eligible = badge.Slug switch
            {
                "premiere_lecon"  => completedCount >= 1,
                "streak_3"        => streakDays >= 3,
                "streak_7"        => streakDays >= 7,
                "xp_100"          => xpTotal >= 100,
                "xp_500"          => xpTotal >= 500,
                "survie_10"       => bestSurvie >= 10,
                "survie_20"       => bestSurvie >= 20,
                "quiz_parfait"    => hasPerfect,
                _                 => false,
            };

            if (eligible)
            {
                db.UserBadges.Add(new UserBadge
                {
                    UserId = userId,
                    BadgeId = badge.Id,
                    EarnedAt = DateTime.UtcNow,
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
