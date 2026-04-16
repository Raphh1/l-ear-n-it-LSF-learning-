namespace LsfApi.Features.Scores;

public record SubmitScoreRequest(string GameType, Guid LessonId, int Score);

public record LeaderboardEntry(string Username, int Score, DateTime PlayedAt);

public record GlobalLeaderboardEntry(string Username, int TotalScore, int Rank);
