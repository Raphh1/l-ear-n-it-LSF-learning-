namespace LsfApi.Domain;

public class GameScore
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string GameType { get; set; } = string.Empty; // quiz, vitesse, inverse, memoire, survie
    public Guid LessonId { get; set; }
    public int Score { get; set; }
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}
