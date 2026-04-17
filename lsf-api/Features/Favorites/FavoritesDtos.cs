namespace LsfApi.Features.Favorites;

public record FavoriteSignDto(
    Guid Id,
    string Word,
    string Slug,
    string? ThumbnailUrl,
    short Difficulty,
    string CategoryName,
    DateTime CreatedAt);
