using LsfApi.Data;
using LsfApi.Domain;
using LsfApi.Features.Badges;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Scores;

public class ScoreService(AppDbContext db, BadgeService badgeService)
{
    public async Task SubmitAsync(Guid userId, string gameType, Guid lessonId, int score,
        int? correctCount = null, int? wrongCount = null, int? durationSeconds = null)
    {
        db.GameScores.Add(new GameScore
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            GameType = gameType,
            LessonId = lessonId,
            Score = score,
            CorrectCount = correctCount,
            WrongCount = wrongCount,
            DurationSeconds = durationSeconds,
            PlayedAt = DateTime.UtcNow,
        });

        await db.SaveChangesAsync();
        await badgeService.AwardEligibleBadgesAsync(userId);
    }

    public async Task<List<GameSessionDto>> GetHistoryAsync(Guid userId, int page, int pageSize)
    {
        return await db.GameScores
            .Where(gs => gs.UserId == userId)
            .OrderByDescending(gs => gs.PlayedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(gs => gs.Lesson)
            .Select(gs => new GameSessionDto(
                gs.GameType,
                gs.Lesson.Title,
                gs.Score,
                gs.CorrectCount,
                gs.WrongCount,
                gs.DurationSeconds,
                gs.PlayedAt
            ))
            .ToListAsync();
    }

    public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(string gameType, Guid lessonId, int top = 10)
    {
        // Meilleur score par utilisateur pour ce jeu/leçon
        return await db.GameScores
            .Where(gs => gs.GameType == gameType && gs.LessonId == lessonId)
            .GroupBy(gs => gs.UserId)
            .Select(g => new
            {
                UserId = g.Key,
                Score = g.Max(gs => gs.Score),
                PlayedAt = g.Max(gs => gs.PlayedAt),
            })
            .OrderByDescending(x => x.Score)
            .Take(top)
            .Join(db.Users, x => x.UserId, u => u.Id, (x, u) => new LeaderboardEntry(
                u.Username,
                x.Score,
                x.PlayedAt
            ))
            .ToListAsync();
    }

    public async Task<List<GlobalLeaderboardEntry>> GetGlobalLeaderboardAsync(int top = 20)
    {
        // Pour chaque combo (userId, gameType, lessonId) → meilleur score
        // Puis on somme par utilisateur
        var ranked = await db.GameScores
            .GroupBy(gs => new { gs.UserId, gs.GameType, gs.LessonId })
            .Select(g => new { g.Key.UserId, Best = g.Max(gs => gs.Score) })
            .GroupBy(x => x.UserId)
            .Select(g => new { UserId = g.Key, TotalScore = g.Sum(x => x.Best) })
            .OrderByDescending(x => x.TotalScore)
            .Take(top)
            .Join(db.Users, x => x.UserId, u => u.Id, (x, u) => new { u.Username, x.TotalScore })
            .ToListAsync();

        return ranked
            .Select((x, i) => new GlobalLeaderboardEntry(x.Username, x.TotalScore, i + 1))
            .ToList();
    }

    public async Task<int?> GetUserBestScoreAsync(Guid userId, string gameType, Guid lessonId)
    {
        return await db.GameScores
            .Where(gs => gs.UserId == userId && gs.GameType == gameType && gs.LessonId == lessonId)
            .Select(gs => (int?)gs.Score)
            .MaxAsync();
    }
}
