namespace LsfApi.Features.Modules;

public record ModuleDto(
    int Id,
    string Title,
    string? Description,
    short Level,
    int SortOrder,
    int LessonCount
);

public record LessonSummaryDto(
    Guid Id,
    string Title,
    string? Description,
    int SortOrder,
    int XpReward,
    int SignCount
);

public record ModuleDetailDto(
    int Id,
    string Title,
    string? Description,
    short Level,
    int SortOrder,
    IEnumerable<LessonSummaryDto> Lessons
);
