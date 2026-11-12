namespace LsfApi.Domain;

public class UserDailyQuest
{
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public string QuestType { get; set; } = string.Empty; // review_signs, play_game, daily_challenge
    public int TargetValue { get; set; }
    public int CurrentValue { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public int XpReward { get; set; }
    public DateTime? CompletedAt { get; set; }

    public User User { get; set; } = null!;
}
