namespace LsfApi.Features.Progress;

public record CompleteLessonRequest(int Score, int Total);

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
