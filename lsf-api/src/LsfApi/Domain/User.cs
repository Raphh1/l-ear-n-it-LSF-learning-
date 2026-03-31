namespace LsfApi.Domain;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserProgress? Progress { get; set; }
    public ICollection<UserLessonCompletion> LessonCompletions { get; set; } = [];
    public ICollection<QuizAttempt> QuizAttempts { get; set; } = [];
}
