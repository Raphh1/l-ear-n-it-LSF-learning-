namespace LsfApi.Domain;

public class Badge
{
    public int Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;

    public ICollection<UserBadge> UserBadges { get; set; } = [];
}
