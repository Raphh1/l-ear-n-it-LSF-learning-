namespace LsfApi.Features.Categories;

public record CategoryDto(
    int Id,
    string Name,
    string Slug,
    string? IconUrl,
    int SortOrder,
    int SignCount
);
