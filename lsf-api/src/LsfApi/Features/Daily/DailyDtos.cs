namespace LsfApi.Features.Daily;

public record DailySignDto(
    Guid Id,
    string Word,
    string Slug,
    string? ThumbnailUrl,
    string? VideoUrl,
    string? GifUrl
);

public record DailyChallenge(
    DailySignDto Sign,
    List<string> Choices,    // 4 mots dont le bon, mélangés
    string Date,             // "2026-04-15"
    bool AlreadyPlayed,
    bool? WasCorrect         // null si pas encore joué
);

public record SubmitDailyRequest(string ChosenWord);

public record SubmitDailyResponse(
    bool IsCorrect,
    string CorrectWord,
    int XpEarned,
    int NewXpTotal
);
