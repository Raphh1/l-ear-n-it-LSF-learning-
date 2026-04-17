namespace LsfApi.Domain;

public class UserLessonCompletion
{
    public Guid UserId { get; set; }
    public Guid LessonId { get; set; }
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public int XpEarned { get; set; }

    public User? User { get; set; }
    public Lesson? Lesson { get; set; }
}
