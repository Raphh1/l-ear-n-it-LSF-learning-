namespace LsfApi.Features.Signs;

public record ElixSignVideoDto(
    string Uri,
    string? Image,
    string? Author
);

public record ElixWordResultDto(
    string Word,
    string? Definition,
    List<ElixSignVideoDto> Videos
);

// Structures internes pour désérialiser la réponse Elix
internal record ElixApiResponse(
    List<ElixApiWord> Data
);

internal record ElixApiWord(
    string Name,
    string? Typology,
    List<ElixApiMeaning> Meanings
);

internal record ElixApiMeaning(
    string? Definition,
    List<ElixApiSign> WordSigns,
    List<ElixApiSign> DefinitionSigns
);

internal record ElixApiSign(
    string Uri,
    string? Image,
    string? Author
);
