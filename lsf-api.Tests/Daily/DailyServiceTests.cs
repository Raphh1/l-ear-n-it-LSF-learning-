using LsfApi.Domain;
using LsfApi.Features.Badges;
using LsfApi.Features.Daily;
using LsfApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Tests.Daily;

public class DailyServiceTests
{
    private static LsfApi.Data.AppDbContext SeedSigns(int count = 10)
    {
        var db = DbHelper.CreateDb();
        for (int i = 0; i < count; i++)
        {
            db.Signs.Add(new Sign
            {
                Id = Guid.NewGuid(),
                Word = $"signe-{i}",
                Slug = $"signe-{i}",
                IsPublished = true,
            });
        }
        db.SaveChanges();
        return db;
    }

    // ── Retourne un challenge non-null quand des signes existent ─────────────────

    [Fact]
    public async Task GetToday_WithSigns_ReturnsChallenge()
    {
        using var db = SeedSigns();
        var svc = new DailyService(db, new BadgeService(db));

        var challenge = await svc.GetTodayChallengeAsync(null);

        Assert.NotNull(challenge);
    }

    // ── Retourne null si aucun signe ─────────────────────────────────────────────

    [Fact]
    public async Task GetToday_WithNoSigns_ReturnsNull()
    {
        using var db = DbHelper.CreateDb();
        var svc = new DailyService(db, new BadgeService(db));

        var challenge = await svc.GetTodayChallengeAsync(null);

        Assert.Null(challenge);
    }

    // ── 4 choix proposés ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetToday_ReturnsExactlyFourChoices()
    {
        using var db = SeedSigns();
        var svc = new DailyService(db, new BadgeService(db));

        var challenge = await svc.GetTodayChallengeAsync(null);

        Assert.Equal(4, challenge!.Choices.Count);
    }

    // ── Le signe du jour est parmi les choix ─────────────────────────────────────

    [Fact]
    public async Task GetToday_CorrectWordIsInChoices()
    {
        using var db = SeedSigns();
        var svc = new DailyService(db, new BadgeService(db));

        var challenge = await svc.GetTodayChallengeAsync(null);

        Assert.Contains(challenge!.Sign.Word, challenge.Choices);
    }

    // ── Déterminisme : deux appels le même jour retournent le même signe ─────────

    [Fact]
    public async Task GetToday_IsDeterministicSameDay()
    {
        using var db = SeedSigns();
        var svc = new DailyService(db, new BadgeService(db));

        var c1 = await svc.GetTodayChallengeAsync(null);
        var c2 = await svc.GetTodayChallengeAsync(null);

        Assert.Equal(c1!.Sign.Id, c2!.Sign.Id);
        Assert.Equal(c1.Date, c2.Date);
    }

    // ── AlreadyPlayed = false pour un visiteur ────────────────────────────────────

    [Fact]
    public async Task GetToday_AnonymousUser_AlreadyPlayedFalse()
    {
        using var db = SeedSigns();
        var svc = new DailyService(db, new BadgeService(db));

        var challenge = await svc.GetTodayChallengeAsync(null);

        Assert.False(challenge!.AlreadyPlayed);
    }

    // ── Soumission correcte → XP attribués ───────────────────────────────────────

    [Fact]
    public async Task Submit_CorrectAnswer_AwardsXp()
    {
        using var db = SeedSigns();
        var userId = Guid.NewGuid();
        db.UserProgress.Add(new UserProgress { UserId = userId });
        await db.SaveChangesAsync();

        var svc = new DailyService(db, new BadgeService(db));
        var challenge = await svc.GetTodayChallengeAsync(userId);

        var result = await svc.SubmitAsync(userId, challenge!.Sign.Word);

        Assert.NotNull(result);
        Assert.True(result.IsCorrect);
        Assert.True(result.XpEarned > 0);
    }

    // ── Soumission incorrecte → XP réduits mais non nuls ─────────────────────────

    [Fact]
    public async Task Submit_WrongAnswer_AwardsSmallXp()
    {
        using var db = SeedSigns();
        var userId = Guid.NewGuid();
        db.UserProgress.Add(new UserProgress { UserId = userId });
        await db.SaveChangesAsync();

        var svc = new DailyService(db, new BadgeService(db));
        var challenge = await svc.GetTodayChallengeAsync(userId);
        var wrongWord = challenge!.Choices.First(w => w != challenge.Sign.Word);

        var result = await svc.SubmitAsync(userId, wrongWord);

        Assert.NotNull(result);
        Assert.False(result.IsCorrect);
        Assert.True(result.XpEarned > 0); // XpWrong = 2
    }

    // ── Idempotence : jouer deux fois le même jour → null au 2ème ────────────────

    [Fact]
    public async Task Submit_TwiceSameDay_SecondReturnsNull()
    {
        using var db = SeedSigns();
        var userId = Guid.NewGuid();
        db.UserProgress.Add(new UserProgress { UserId = userId });
        await db.SaveChangesAsync();

        var svc = new DailyService(db, new BadgeService(db));
        var challenge = await svc.GetTodayChallengeAsync(userId);

        await svc.SubmitAsync(userId, challenge!.Sign.Word);
        var second = await svc.SubmitAsync(userId, challenge.Sign.Word);

        Assert.Null(second);
    }

    // ── AlreadyPlayed = true après soumission ─────────────────────────────────────

    [Fact]
    public async Task GetToday_AfterSubmit_AlreadyPlayedTrue()
    {
        using var db = SeedSigns();
        var userId = Guid.NewGuid();
        db.UserProgress.Add(new UserProgress { UserId = userId });
        await db.SaveChangesAsync();

        var svc = new DailyService(db, new BadgeService(db));
        var challenge = await svc.GetTodayChallengeAsync(userId);
        await svc.SubmitAsync(userId, challenge!.Sign.Word);

        var updated = await svc.GetTodayChallengeAsync(userId);
        Assert.True(updated!.AlreadyPlayed);
    }
}
