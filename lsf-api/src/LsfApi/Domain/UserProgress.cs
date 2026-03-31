namespace LsfApi.Domain;

public class UserProgress
{
    public Guid UserId { get; set; }
    public int XpTotal { get; set; } = 0;
    public int StreakDays { get; set; } = 0;
    public DateOnly? LastActivity { get; set; }
    public int LessonsCompleted { get; set; } = 0;

    public User? User { get; set; }
}
