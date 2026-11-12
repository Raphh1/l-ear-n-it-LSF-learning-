namespace LsfApi.Features.Signs;

public record SignSummaryDto(
    Guid Id,
    string Word,
    string Slug,
    string? ThumbnailUrl,
    short Difficulty,
    string CategoryName
);

public record SignDetailDto(
    Guid Id,
    string Word,
    string Slug,
    string? Definition,
    string? VideoUrl,
    string? GifUrl,
    string? ThumbnailUrl,
    short Difficulty,
    string[] Tags,
    int CategoryId,
    string CategoryName,
    List<SignMeaningDto> Meanings
);

// Sens du mot (Elix) : le principal porte les variantes du signe, les autres sont des homonymes
public record SignMeaningDto(
    bool IsPrimary,
    string? Definition,
    string? DefinitionVideoUrl,
    string? DefinitionThumbnailUrl,
    List<SignVideoDto> Videos
);

public record SignVideoDto(string VideoUrl, string? ThumbnailUrl, string? Author);

public record SignsQueryParams(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    int? CategoryId = null
);
