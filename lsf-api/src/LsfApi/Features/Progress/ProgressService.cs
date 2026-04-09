using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Progress;

public class ProgressService(AppDbContext db)
{
    public async Task<ProgressResponse?> GetProgressAsync(Guid userId)
    {
        var progress = await db.UserProgress
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (progress is null) return null;

        var completedIds = await db.UserLessonCompletions
            .Where(c => c.UserId == userId)
            .Select(c => c.LessonId)
            .ToListAsync();

        return new ProgressResponse(
            progress.XpTotal,
            progress.StreakDays,
            progress.LessonsCompleted,
            completedIds
        );
    }

    public async Task<CompleteLessonResponse?> CompleteLessonAsync(Guid userId, Guid lessonId, int score, int total)
    {
        var lesson = await db.Lessons.FindAsync(lessonId);
        if (lesson is null) return null;

        var progress = await db.UserProgress.FindAsync(userId);
        if (progress is null) return null;

        var xpEarned = total > 0 ? (int)Math.Round((double)score / total * lesson.XpReward) : 0;

        var existing = await db.UserLessonCompletions
            .FirstOrDefaultAsync(c => c.UserId == userId && c.LessonId == lessonId);

        var isFirst = existing is null;

        if (isFirst)
        {
            db.UserLessonCompletions.Add(new UserLessonCompletion
            {
                UserId = userId,
                LessonId = lessonId,
                XpEarned = xpEarned,
                CompletedAt = DateTime.UtcNow,
            });

            progress.XpTotal += xpEarned;
            progress.LessonsCompleted += 1;
        }

        // Mise à jour du streak
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (progress.LastActivity is null || progress.LastActivity < today.AddDays(-1))
            progress.StreakDays = 1;
        else if (progress.LastActivity == today.AddDays(-1))
            progress.StreakDays += 1;
        // Si LastActivity == today : pas de changement

        progress.LastActivity = today;

        await db.SaveChangesAsync();

        return new CompleteLessonResponse(xpEarned, isFirst, progress.XpTotal, progress.StreakDays);
    }
}
