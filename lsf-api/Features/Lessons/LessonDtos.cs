namespace LsfApi.Features.Lessons;

public record SignInLessonDto(
    Guid Id,
    string Word,
    string Slug,
    string? ThumbnailUrl,
    string? VideoUrl,
    string? GifUrl,
    short Difficulty
);

public record LessonDetailDto(
    Guid Id,
    int ModuleId,
    string Title,
    string? Description,
    int SortOrder,
    int XpReward,
    string LessonType,
    IEnumerable<SignInLessonDto> Signs
);
