using LsfApi.Domain;
using LsfApi.Features.Revision;
using LsfApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Tests.Revision;

public class RevisionServiceTests
{
    private static (Guid userId, Guid signId) Seed(LsfApi.Data.AppDbContext db)
    {
        var userId = Guid.NewGuid();
        var signId = Guid.NewGuid();

        db.Signs.Add(new Sign
        {
            Id = signId,
            Word = "chat",
            Slug = "chat",
            IsPublished = true,
        });
        db.SaveChanges();

        return (userId, signId);
    }

    // ── SM-2 : premier passage correct ───────────────────────────────────────────

    [Fact]
    public async Task FirstCorrect_SetsInterval1_Repetitions1()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);

        var stat = await db.UserSignStats.SingleAsync();
        Assert.Equal(1, stat.SrsRepetitions);
        Assert.Equal(1, stat.SrsInterval);
        Assert.Equal(1, stat.CorrectCount);
        Assert.Equal(0, stat.WrongCount);
    }

    // ── SM-2 : deuxième passage correct ──────────────────────────────────────────

    [Fact]
    public async Task SecondCorrect_SetsInterval6_Repetitions2()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);
        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);

        var stat = await db.UserSignStats.SingleAsync();
        Assert.Equal(2, stat.SrsRepetitions);
        Assert.Equal(6, stat.SrsInterval);
    }

    // ── SM-2 : troisième passage correct (EF=2.5) ────────────────────────────────

    [Fact]
    public async Task ThirdCorrect_UsesEaseFactor()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);
        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);
        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);

        var stat = await db.UserSignStats.SingleAsync();
        Assert.Equal(3, stat.SrsRepetitions);
        // intervalle = round(6 * 2.5) = 15
        Assert.Equal(15, stat.SrsInterval);
    }

    // ── SM-2 : mauvaise réponse remet à zéro ─────────────────────────────────────

    [Fact]
    public async Task WrongAnswer_ResetsRepetitionsAndInterval()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        // Deux bonnes réponses pour avancer dans le SRS
        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);
        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);

        // Mauvaise réponse
        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, false)]);

        var stat = await db.UserSignStats.SingleAsync();
        Assert.Equal(0, stat.SrsRepetitions);
        Assert.Equal(1, stat.SrsInterval);
        Assert.Equal(2, stat.CorrectCount);
        Assert.Equal(1, stat.WrongCount);
    }

    // ── SM-2 : NextReviewAt est dans le futur après bonne réponse ────────────────

    [Fact]
    public async Task Correct_SetsNextReviewAtInFuture()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        var before = DateOnly.FromDateTime(DateTime.UtcNow);
        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, true)]);

        var stat = await db.UserSignStats.SingleAsync();
        Assert.NotNull(stat.NextReviewAt);
        Assert.True(stat.NextReviewAt >= before.AddDays(1));
    }

    // ── SM-2 : mauvaise réponse → NextReviewAt = demain ─────────────────────────

    [Fact]
    public async Task WrongAnswer_SetsNextReviewAtTomorrow()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        await svc.SubmitAttemptsAsync(userId, [new SignAttemptDto(signId, false)]);

        var stat = await db.UserSignStats.SingleAsync();
        var tomorrow = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1);
        Assert.Equal(tomorrow, stat.NextReviewAt);
    }

    // ── GetDueSigns : renvoie les signes dont NextReviewAt <= aujourd'hui ─────────

    [Fact]
    public async Task GetDueSigns_ReturnsDueAndUnscheduled()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        // Un signe avec NextReviewAt dans le passé
        db.UserSignStats.Add(new UserSignStat
        {
            UserId = userId,
            SignId = signId,
            NextReviewAt = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-1),
        });
        await db.SaveChangesAsync();

        var due = await svc.GetDueSignsAsync(userId);

        Assert.Single(due);
    }

    // ── GetDueSigns : un signe futur n'est PAS renvoyé ───────────────────────────

    [Fact]
    public async Task GetDueSigns_ExcludesFutureSigns()
    {
        using var db = DbHelper.CreateDb();
        var (userId, signId) = Seed(db);
        var svc = new RevisionService(db);

        db.UserSignStats.Add(new UserSignStat
        {
            UserId = userId,
            SignId = signId,
            NextReviewAt = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(5),
        });
        await db.SaveChangesAsync();

        var due = await svc.GetDueSignsAsync(userId);

        Assert.Empty(due);
    }

    // ── Plusieurs tentatives dans un seul appel ───────────────────────────────────

    [Fact]
    public async Task MultipleAttempts_AreAllPersisted()
    {
        using var db = DbHelper.CreateDb();
        var userId = Guid.NewGuid();

        var sign1 = new Sign { Id = Guid.NewGuid(), Word = "chat", Slug = "chat", IsPublished = true };
        var sign2 = new Sign { Id = Guid.NewGuid(), Word = "chien", Slug = "chien", IsPublished = true };
        db.Signs.AddRange(sign1, sign2);
        await db.SaveChangesAsync();

        var svc = new RevisionService(db);
        await svc.SubmitAttemptsAsync(userId,
        [
            new SignAttemptDto(sign1.Id, true),
            new SignAttemptDto(sign2.Id, false),
        ]);

        Assert.Equal(2, await db.UserSignStats.CountAsync());
    }
}
