namespace LsfApi.Domain;

public class QuizAttempt
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid QuizId { get; set; }
    public int Score { get; set; }
    public int MaxScore { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Quiz? Quiz { get; set; }
}
