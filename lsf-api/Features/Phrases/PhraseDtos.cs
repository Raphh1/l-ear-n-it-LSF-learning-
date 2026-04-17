namespace LsfApi.Features.Phrases;

public record SignInPhraseDto(
    Guid Id,
    string Word,
    string Slug,
    string? VideoUrl,
    string? GifUrl,
    string? ThumbnailUrl
);

public record PhraseDto(
    Guid Id,
    string TextFr,
    string TextLsf,
    string? VideoUrl,
    IEnumerable<SignInPhraseDto> Signs  // dans l'ordre LSF correct
);

public record PhraseLessonDto(
    Guid Id,
    string Title,
    int XpReward,
    IEnumerable<PhraseDto> Phrases
);
