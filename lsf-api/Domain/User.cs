namespace LsfApi.Domain;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    // Incrémenté pour invalider tous les tokens déjà émis (changement de mot de passe, déconnexion partout)
    public int TokenVersion { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public UserProgress? Progress { get; set; }
    public ICollection<UserLessonCompletion> LessonCompletions { get; set; } = [];
    public ICollection<QuizAttempt> QuizAttempts { get; set; } = [];
    public ICollection<UserFavorite> Favorites { get; set; } = [];
    public ICollection<UserBadge> Badges { get; set; } = [];
    public ICollection<GameScore> GameScores { get; set; } = [];
    public ICollection<UserSignStat> SignStats { get; set; } = [];
    public ICollection<UserDailyAttempt> DailyAttempts { get; set; } = [];
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = [];
    public ICollection<UserDailyQuest> DailyQuests { get; set; } = [];
}
