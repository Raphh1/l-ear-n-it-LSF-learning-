namespace LsfApi.Features.Scores;

public record SubmitScoreRequest(
    string GameType,
    Guid LessonId,
    int Score,
    int? CorrectCount = null,
    int? WrongCount = null,
    int? DurationSeconds = null
);

public record LeaderboardEntry(string Username, int Score, DateTime PlayedAt);

public record GlobalLeaderboardEntry(string Username, int TotalScore, int Rank);

public record GameSessionDto(
    string GameType,
    string LessonTitle,
    int Score,
    int? CorrectCount,
    int? WrongCount,
    int? DurationSeconds,
    DateTime PlayedAt
);
