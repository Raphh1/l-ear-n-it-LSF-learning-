namespace LsfApi.Features.Progress;

public record CompleteLessonRequest(int Score, int Total);

public record AwardXpRequest(int Amount);

public record AwardXpResponse(int XpEarned, int NewXpTotal, int NewStreakDays);

public record ProgressResponse(
    int XpTotal,
    int StreakDays,
    int LessonsCompleted,
    IEnumerable<Guid> CompletedLessonIds
);

public record CompleteLessonResponse(
    int XpEarned,
    bool IsFirstCompletion,
    int NewXpTotal,
    int NewStreakDays
);
