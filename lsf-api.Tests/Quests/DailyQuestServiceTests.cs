using LsfApi.Domain;
using LsfApi.Features.Quests;
using LsfApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Tests.Quests;

public class DailyQuestServiceTests
{
    private static (LsfApi.Data.AppDbContext db, DailyQuestService svc, Guid userId) Setup()
    {
        var db = DbHelper.CreateDb();
        var userId = Guid.NewGuid();
        db.UserProgress.Add(new UserProgress { UserId = userId });
        db.SaveChanges();
        return (db, new DailyQuestService(db), userId);
    }

    // ── Création des quêtes du jour ───────────────────────────────────────────────

    [Fact]
    public async Task GetOrCreate_CreatesThreeQuestsOnFirstCall()
    {
        var (db, svc, userId) = Setup();

        var quests = await svc.GetOrCreateTodayQuestsAsync(userId);

        Assert.Equal(3, quests.Count);
        Assert.Contains(quests, q => q.QuestType == "review_signs");
        Assert.Contains(quests, q => q.QuestType == "play_game");
        Assert.Contains(quests, q => q.QuestType == "daily_challenge");
    }

    // ── Idempotence : second appel retourne les mêmes quêtes ─────────────────────

    [Fact]
    public async Task GetOrCreate_IsIdempotent()
    {
        var (db, svc, userId) = Setup();

        await svc.GetOrCreateTodayQuestsAsync(userId);
        await svc.GetOrCreateTodayQuestsAsync(userId);

        var count = await db.UserDailyQuests.CountAsync(q => q.UserId == userId);
        Assert.Equal(3, count);
    }

    // ── Incrément normal ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Increment_IncreasesCurrentValue()
    {
        var (db, svc, userId) = Setup();
        await svc.GetOrCreateTodayQuestsAsync(userId);

        await svc.IncrementQuestAsync(userId, "play_game");

        var quest = await db.UserDailyQuests.SingleAsync(q => q.UserId == userId && q.QuestType == "play_game");
        Assert.Equal(1, quest.CurrentValue);
        Assert.True(quest.IsCompleted); // target = 1
    }

    // ── Complétion : XP attribués et CompletedAt renseigné ───────────────────────

    [Fact]
    public async Task Increment_WhenCompleted_AwardsXpAndSetsTimestamp()
    {
        var (db, svc, userId) = Setup();
        await svc.GetOrCreateTodayQuestsAsync(userId);

        var before = DateTime.UtcNow;
        await svc.IncrementQuestAsync(userId, "daily_challenge"); // target = 1

        var quest = await db.UserDailyQuests.SingleAsync(q => q.UserId == userId && q.QuestType == "daily_challenge");
        Assert.True(quest.IsCompleted);
        Assert.NotNull(quest.CompletedAt);
        Assert.True(quest.CompletedAt >= before);

        var progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(quest.XpReward, progress!.XpTotal);
    }

    // ── Incrément sur quête déjà complétée → pas de double XP ───────────────────

    [Fact]
    public async Task Increment_AfterCompletion_IsIgnored()
    {
        var (db, svc, userId) = Setup();
        await svc.GetOrCreateTodayQuestsAsync(userId);

        await svc.IncrementQuestAsync(userId, "play_game"); // complète la quête
        var progressAfterFirst = (await db.UserProgress.FindAsync(userId))!.XpTotal;

        await svc.IncrementQuestAsync(userId, "play_game"); // devrait être ignoré

        var progress = await db.UserProgress.FindAsync(userId);
        Assert.Equal(progressAfterFirst, progress!.XpTotal);
    }

    // ── review_signs : incrément par tranche ─────────────────────────────────────

    [Fact]
    public async Task Increment_ReviewSigns_RequiresTenToComplete()
    {
        var (db, svc, userId) = Setup();
        await svc.GetOrCreateTodayQuestsAsync(userId);

        for (int i = 0; i < 9; i++)
            await svc.IncrementQuestAsync(userId, "review_signs");

        var quest = await db.UserDailyQuests.SingleAsync(q => q.UserId == userId && q.QuestType == "review_signs");
        Assert.False(quest.IsCompleted);
        Assert.Equal(9, quest.CurrentValue);

        await svc.IncrementQuestAsync(userId, "review_signs");
        quest = await db.UserDailyQuests.SingleAsync(q => q.UserId == userId && q.QuestType == "review_signs");
        Assert.True(quest.IsCompleted);
    }

    // ── CurrentValue ne dépasse pas TargetValue ───────────────────────────────────

    [Fact]
    public async Task Increment_CurrentValueCappedAtTarget()
    {
        var (db, svc, userId) = Setup();
        await svc.GetOrCreateTodayQuestsAsync(userId);

        // On complète puis on essaie d'incrémenter encore
        for (int i = 0; i < 20; i++)
            await svc.IncrementQuestAsync(userId, "review_signs");

        var quest = await db.UserDailyQuests.SingleAsync(q => q.UserId == userId && q.QuestType == "review_signs");
        Assert.Equal(quest.TargetValue, quest.CurrentValue);
    }
}
