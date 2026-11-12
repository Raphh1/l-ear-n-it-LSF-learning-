using LsfApi.Domain;
using LsfApi.Features.Badges;
using LsfApi.Features.Scores;
using LsfApi.Tests.Helpers;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Tests.Scores;

public class ScoreServiceTests
{
    private static (ScoreService svc, LsfApi.Data.AppDbContext db, Guid userId, Guid lessonId) Setup()
    {
        var db = DbHelper.CreateDb();

        var userId = Guid.NewGuid();
        var lessonId = Guid.NewGuid();

        db.Users.Add(new User { Id = userId, Email = "u@test.com", Username = "user" });
        db.Lessons.Add(new Lesson { Id = lessonId, ModuleId = 1, Title = "Leçon test", SortOrder = 1 });
        db.UserProgress.Add(new UserProgress { UserId = userId });
        db.SaveChanges();

        var badgeSvc = new BadgeService(db);
        var svc = new ScoreService(db, badgeSvc);
        return (svc, db, userId, lessonId);
    }

    // ── Submit ───────────────────────────────────────────────────────────────

    [Fact]
    public async Task Submit_PersistsScore()
    {
        var (svc, db, userId, lessonId) = Setup();

        await svc.SubmitAsync(userId, "quiz", lessonId, 85, correctCount: 8, wrongCount: 2);

        var score = await db.GameScores.SingleAsync();
        Assert.Equal(userId, score.UserId);
        Assert.Equal("quiz", score.GameType);
        Assert.Equal(85, score.Score);
        Assert.Equal(8, score.CorrectCount);
        Assert.Equal(2, score.WrongCount);
    }

    [Fact]
    public async Task Submit_MultipleScores_AllPersisted()
    {
        var (svc, db, userId, lessonId) = Setup();

        await svc.SubmitAsync(userId, "quiz", lessonId, 70);
        await svc.SubmitAsync(userId, "quiz", lessonId, 90);

        Assert.Equal(2, await db.GameScores.CountAsync());
    }

    // ── GetHistory ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetHistory_ReturnsUserScoresNewestFirst()
    {
        var (svc, db, userId, lessonId) = Setup();
        await svc.SubmitAsync(userId, "quiz", lessonId, 60);
        await svc.SubmitAsync(userId, "quiz", lessonId, 80);

        var history = await svc.GetHistoryAsync(userId, page: 1, pageSize: 10);

        Assert.Equal(2, history.Count);
        Assert.Equal(80, history[0].Score); // newest first
        Assert.Equal(60, history[1].Score);
    }

    [Fact]
    public async Task GetHistory_OtherUserScoresExcluded()
    {
        var (svc, db, userId, lessonId) = Setup();
        var otherId = Guid.NewGuid();
        db.Users.Add(new User { Id = otherId, Email = "other@test.com", Username = "other" });
        db.SaveChanges();

        await svc.SubmitAsync(userId, "quiz", lessonId, 70);
        await svc.SubmitAsync(otherId, "quiz", lessonId, 90);

        var history = await svc.GetHistoryAsync(userId, page: 1, pageSize: 10);

        Assert.Single(history);
        Assert.Equal(70, history[0].Score);
    }

    [Fact]
    public async Task GetHistory_PaginationWorks()
    {
        var (svc, db, userId, lessonId) = Setup();
        for (int i = 0; i < 5; i++)
            await svc.SubmitAsync(userId, "quiz", lessonId, i * 10);

        var page1 = await svc.GetHistoryAsync(userId, page: 1, pageSize: 3);
        var page2 = await svc.GetHistoryAsync(userId, page: 2, pageSize: 3);

        Assert.Equal(3, page1.Count);
        Assert.Equal(2, page2.Count);
    }

    // ── GetLeaderboard ───────────────────────────────────────────────────────

    [Fact]
    public async Task GetLeaderboard_ReturnsOnlyBestScorePerUser()
    {
        var (svc, db, userId, lessonId) = Setup();
        await svc.SubmitAsync(userId, "quiz", lessonId, 60);
        await svc.SubmitAsync(userId, "quiz", lessonId, 90);

        var board = await svc.GetLeaderboardAsync("quiz", lessonId);

        Assert.Single(board);
        Assert.Equal(90, board[0].Score);
    }

    [Fact]
    public async Task GetLeaderboard_OrderedByScoreDesc()
    {
        var (svc, db, userId, lessonId) = Setup();
        var user2 = Guid.NewGuid();
        db.Users.Add(new User { Id = user2, Email = "u2@test.com", Username = "user2" });
        db.SaveChanges();

        await svc.SubmitAsync(userId, "quiz", lessonId, 70);
        await svc.SubmitAsync(user2, "quiz", lessonId, 95);

        var board = await svc.GetLeaderboardAsync("quiz", lessonId);

        Assert.Equal(2, board.Count);
        Assert.Equal(95, board[0].Score);
        Assert.Equal(70, board[1].Score);
    }

    [Fact]
    public async Task GetLeaderboard_OnlyMatchingGameTypeAndLesson()
    {
        var (svc, db, userId, lessonId) = Setup();
        var otherLesson = Guid.NewGuid();
        db.Lessons.Add(new Lesson { Id = otherLesson, ModuleId = 1, Title = "Autre", SortOrder = 2 });
        db.SaveChanges();

        await svc.SubmitAsync(userId, "quiz", lessonId, 80);
        await svc.SubmitAsync(userId, "vitesse", lessonId, 90);
        await svc.SubmitAsync(userId, "quiz", otherLesson, 95);

        var board = await svc.GetLeaderboardAsync("quiz", lessonId);

        Assert.Single(board);
        Assert.Equal(80, board[0].Score);
    }

    // ── GetGlobalLeaderboard ─────────────────────────────────────────────────

    [Fact]
    public async Task GetGlobalLeaderboard_SumsBestScoresPerCombo()
    {
        var (svc, db, userId, lessonId) = Setup();
        var lesson2 = Guid.NewGuid();
        db.Lessons.Add(new Lesson { Id = lesson2, ModuleId = 1, Title = "L2", SortOrder = 2 });
        db.SaveChanges();

        // lesson1: best is 90
        await svc.SubmitAsync(userId, "quiz", lessonId, 70);
        await svc.SubmitAsync(userId, "quiz", lessonId, 90);
        // lesson2: best is 80 → total = 170
        await svc.SubmitAsync(userId, "quiz", lesson2, 80);

        var board = await svc.GetGlobalLeaderboardAsync();

        Assert.Single(board);
        Assert.Equal(170, board[0].TotalScore);
    }

    [Fact]
    public async Task GetGlobalLeaderboard_AssignsRankStartingAtOne()
    {
        var (svc, db, userId, lessonId) = Setup();
        var user2 = Guid.NewGuid();
        db.Users.Add(new User { Id = user2, Email = "u2@test.com", Username = "user2" });
        db.UserProgress.Add(new UserProgress { UserId = user2 });
        db.SaveChanges();

        await svc.SubmitAsync(userId, "quiz", lessonId, 50);
        await svc.SubmitAsync(user2, "quiz", lessonId, 80);

        var board = await svc.GetGlobalLeaderboardAsync();

        Assert.Equal(1, board[0].Rank);
        Assert.Equal(2, board[1].Rank);
        Assert.Equal(80, board[0].TotalScore);
    }

    // ── GetUserBestScore ─────────────────────────────────────────────────────

    [Fact]
    public async Task GetUserBestScore_ReturnsMaxScore()
    {
        var (svc, _, userId, lessonId) = Setup();
        await svc.SubmitAsync(userId, "quiz", lessonId, 60);
        await svc.SubmitAsync(userId, "quiz", lessonId, 90);

        var best = await svc.GetUserBestScoreAsync(userId, "quiz", lessonId);

        Assert.Equal(90, best);
    }

    [Fact]
    public async Task GetUserBestScore_NoScores_ReturnsNull()
    {
        var (svc, _, userId, lessonId) = Setup();

        var best = await svc.GetUserBestScoreAsync(userId, "quiz", lessonId);

        Assert.Null(best);
    }
}
