namespace LsfApi.Domain;

public class UserFavorite
{
    public Guid UserId { get; set; }
    public Guid SignId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Sign? Sign { get; set; }
}
