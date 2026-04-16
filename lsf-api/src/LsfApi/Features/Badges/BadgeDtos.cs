namespace LsfApi.Features.Badges;

public record BadgeDto(
    int Id,
    string Slug,
    string Title,
    string Description,
    string Icon,
    bool Earned,
    DateTime? EarnedAt
);
