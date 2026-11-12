using LsfApi.Domain;
using LsfApi.Features.Badges;
using LsfApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Tests.Badges;

public class BadgeServiceTests
{
    private static (BadgeService svc, LsfApi.Data.AppDbContext db, Guid userId) Setup(params string[] slugs)
    {
        var db = DbHelper.CreateDb();
        var userId = Guid.NewGuid();

        db.Users.Add(new User { Id = userId, Email = "u@test.com", Username = "user" });
        db.UserProgress.Add(new UserProgress { UserId = userId });

        int id = 1;
        foreach (var slug in slugs)
            db.Badges.Add(new Badge { Id = id++, Slug = slug, Title = slug, Description = "", Icon = "" });

        db.SaveChanges();

        return (new BadgeService(db), db, userId);
    }

    private static async Task SetProgress(LsfApi.Data.AppDbContext db, Guid userId,
        int lessons = 0, int xp = 0, int streak = 0)
    {
        var p = await db.UserProgress.FindAsync(userId);
        p!.LessonsCompleted = lessons;
        p.XpTotal = xp;
        p.StreakDays = streak;
        await db.SaveChangesAsync();
    }

    private static void AddScore(LsfApi.Data.AppDbContext db, Guid userId, string gameType, int score, Guid? lessonId = null)
    {
        db.GameScores.Add(new GameScore
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            GameType = gameType,
            LessonId = lessonId ?? Guid.NewGuid(),
            Score = score,
            PlayedAt = DateTime.UtcNow,
        });
        db.SaveChanges();
    }

    // ── premiere_lecon ───────────────────────────────────────────────────────

    [Fact]
    public async Task PremiereLecon_OneCompleted_Awarded()
    {
        var (svc, db, userId) = Setup("premiere_lecon");
        await SetProgress(db, userId, lessons: 1);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Single(await db.UserBadges.ToListAsync());
    }

    [Fact]
    public async Task PremiereLecon_ZeroCompleted_NotAwarded()
    {
        var (svc, db, userId) = Setup("premiere_lecon");

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Empty(await db.UserBadges.ToListAsync());
    }

    // ── streak ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Streak3_ExactlyThree_Awarded()
    {
        var (svc, db, userId) = Setup("streak_3");
        await SetProgress(db, userId, streak: 3);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Single(await db.UserBadges.ToListAsync());
    }

    [Fact]
    public async Task Streak7_SixDays_NotAwarded()
    {
        var (svc, db, userId) = Setup("streak_7");
        await SetProgress(db, userId, streak: 6);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Empty(await db.UserBadges.ToListAsync());
    }

    // ── xp ───────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Xp100_Exactly100_Awarded()
    {
        var (svc, db, userId) = Setup("xp_100");
        await SetProgress(db, userId, xp: 100);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Single(await db.UserBadges.ToListAsync());
    }

    [Fact]
    public async Task Xp500_Only400_NotAwarded()
    {
        var (svc, db, userId) = Setup("xp_500");
        await SetProgress(db, userId, xp: 400);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Empty(await db.UserBadges.ToListAsync());
    }

    [Fact]
    public async Task BothXpBadges_500Xp_BothAwarded()
    {
        var (svc, db, userId) = Setup("xp_100", "xp_500");
        await SetProgress(db, userId, xp: 500);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Equal(2, await db.UserBadges.CountAsync());
    }

    // ── survie ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Survie10_Score10_Awarded()
    {
        var (svc, db, userId) = Setup("survie_10");
        AddScore(db, userId, "survie", 10);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Single(await db.UserBadges.ToListAsync());
    }

    [Fact]
    public async Task Survie20_BestScoreIs15_OnlySurvie10Awarded()
    {
        var (svc, db, userId) = Setup("survie_10", "survie_20");
        AddScore(db, userId, "survie", 15);

        await svc.AwardEligibleBadgesAsync(userId);

        var badges = await db.UserBadges.ToListAsync();
        Assert.Single(badges); // only survie_10
    }

    // ── quiz_parfait ─────────────────────────────────────────────────────────

    [Fact]
    public async Task QuizParfait_Score100OnQuiz_Awarded()
    {
        var (svc, db, userId) = Setup("quiz_parfait");
        AddScore(db, userId, "quiz", 100);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Single(await db.UserBadges.ToListAsync());
    }

    [Fact]
    public async Task QuizParfait_Score100OnInverse_Awarded()
    {
        var (svc, db, userId) = Setup("quiz_parfait");
        AddScore(db, userId, "inverse", 100);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Single(await db.UserBadges.ToListAsync());
    }

    [Fact]
    public async Task QuizParfait_Score99_NotAwarded()
    {
        var (svc, db, userId) = Setup("quiz_parfait");
        AddScore(db, userId, "quiz", 99);

        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Empty(await db.UserBadges.ToListAsync());
    }

    // ── no double award ──────────────────────────────────────────────────────

    [Fact]
    public async Task AwardTwice_BadgeNotDuplicated()
    {
        var (svc, db, userId) = Setup("xp_100");
        await SetProgress(db, userId, xp: 200);

        await svc.AwardEligibleBadgesAsync(userId);
        await svc.AwardEligibleBadgesAsync(userId);

        Assert.Single(await db.UserBadges.ToListAsync());
    }
}
