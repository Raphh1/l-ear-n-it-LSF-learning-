namespace LsfApi.Domain;

public class UserSignStat
{
    public Guid UserId { get; set; }
    public Guid SignId { get; set; }
    public int CorrectCount { get; set; } = 0;
    public int WrongCount { get; set; } = 0;
    public DateTime LastAttemptAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Sign Sign { get; set; } = null!;
}
