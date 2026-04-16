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
    int CorrectCount
);
