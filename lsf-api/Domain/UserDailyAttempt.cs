namespace LsfApi.Domain;

public class UserDailyAttempt
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public Guid SignId { get; set; }
    public bool IsCorrect { get; set; }
    public DateTime AnsweredAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Sign Sign { get; set; } = null!;
}
