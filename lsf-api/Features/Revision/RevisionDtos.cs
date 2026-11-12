namespace LsfApi.Features.Revision;

public record SignAttemptDto(Guid SignId, bool IsCorrect);

public record SubmitAttemptsRequest(List<SignAttemptDto> Attempts);

public record RevisionSignDto(
    Guid Id,
    string Word,
    string Slug,
    string? ThumbnailUrl,
    string? VideoUrl,
    string? GifUrl,
    int WrongCount,
    int CorrectCount,
    DateOnly? NextReviewAt,
    int SrsInterval
);

public record SignStatDto(
    int CorrectCount,
    int WrongCount,
    DateTime? LastAttemptAt,
    int SrsInterval,
    DateOnly? NextReviewAt
);

public record GlobalStatsDto(
    int TotalSignsPracticed,
    int TotalCorrect,
    int TotalWrong,
    double SuccessRate,
    string? BestSignWord,
    string? BestSignSlug,
    string? HardestSignWord,
    string? HardestSignSlug,
    DateTime? LastPracticeAt,
    int DueForReviewCount
);
