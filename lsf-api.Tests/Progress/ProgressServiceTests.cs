using LsfApi.Domain;
using LsfApi.Features.Badges;
using LsfApi.Features.Progress;
using LsfApi.Tests.Helpers;

namespace LsfApi.Tests.Progress;

public class ProgressServiceTests
{
    private static (LsfApi.Data.AppDbContext db, ProgressService svc, Guid userId, Guid lessonId) Setup()
    {
        var db = DbHelper.CreateDb();

        var userId = Guid.NewGuid();
        var lessonId = Guid.NewGuid();

        db.UserProgress.Add(new UserProgress { UserId = userId });
        db.Lessons.Add(new Lesson
        {
            Id = lessonId,
            Title = "Test",
            XpReward = 100,
            IsPublished = true,
        });
        db.SaveChanges();

        var badgeService = new BadgeService(db);
        var svc = new ProgressService(db, badgeService);

        return (db, svc, userId, lessonId);
    }

    // ── Première activité → streak = 1 ───────────────────────────────────────────

    [Fact]
    public async Task FirstActivity_StartsStreakAt1()
    {
        var (db, svc, userId, lessonId) = Setup();

        await svc.CompleteLessonAsync(userId, lessonId, 10, 10);

        var progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(1, progress!.StreakDays);
    }

    // ── Même jour → streak ne change pas ─────────────────────────────────────────

    [Fact]
    public async Task SameDay_DoesNotIncrementStreak()
    {
        var (db, svc, userId, lessonId) = Setup();

        // Simule une activité hier → streak = 1, LastActivity = hier
        var progress = await db.UserProgress.FindAsync(userId);
        progress!.LastActivity = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);
        progress.StreakDays = 1;
        await db.SaveChangesAsync();

        // Deux actions aujourd'hui
        await svc.AwardXpAsync(userId, 10);
        await svc.AwardXpAsync(userId, 10);

        progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(2, progress!.StreakDays); // +1 pour le 1er appel de ce jour, pas le 2ème
    }

    // ── Jour consécutif → streak += 1 ────────────────────────────────────────────

    [Fact]
    public async Task ConsecutiveDay_IncrementsStreak()
    {
        var (db, svc, userId, lessonId) = Setup();

        var progress = await db.UserProgress.FindAsync(userId);
        progress!.LastActivity = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1);
        progress.StreakDays = 5;
        await db.SaveChangesAsync();

        await svc.AwardXpAsync(userId, 10);

        progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(6, progress!.StreakDays);
    }

    // ── Jour manqué → streak repart à 1 ──────────────────────────────────────────

    [Fact]
    public async Task MissedDay_ResetsStreak()
    {
        var (db, svc, userId, lessonId) = Setup();

        var progress = await db.UserProgress.FindAsync(userId);
        progress!.LastActivity = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-3);
        progress.StreakDays = 10;
        await db.SaveChangesAsync();

        await svc.AwardXpAsync(userId, 10);

        progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(1, progress!.StreakDays);
    }

    // ── XP attribués correctement ─────────────────────────────────────────────────

    [Fact]
    public async Task AwardXp_IncreasesXpTotal()
    {
        var (db, svc, userId, _) = Setup();

        await svc.AwardXpAsync(userId, 50);

        var progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(50, progress!.XpTotal);
    }

    // ── AwardXp avec montant nul → pas de changement ─────────────────────────────

    [Fact]
    public async Task AwardXp_ZeroAmount_ChangesNothing()
    {
        var (db, svc, userId, _) = Setup();

        var result = await svc.AwardXpAsync(userId, 0);

        Assert.Null(result);
        var progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(0, progress!.XpTotal);
    }

    // ── CompletLesson : idempotent (XP seulement à la première complétion) ────────

    [Fact]
    public async Task CompleteLesson_IdempotentXp()
    {
        var (db, svc, userId, lessonId) = Setup();

        await svc.CompleteLessonAsync(userId, lessonId, 10, 10);
        await svc.CompleteLessonAsync(userId, lessonId, 10, 10);

        var progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(100, progress!.XpTotal); // XP gagné une seule fois
    }
}
