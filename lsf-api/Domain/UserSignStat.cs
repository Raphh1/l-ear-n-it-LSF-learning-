namespace LsfApi.Domain;

public class UserSignStat
{
    public Guid UserId { get; set; }
    public Guid SignId { get; set; }
    public int CorrectCount { get; set; } = 0;
    public int WrongCount { get; set; } = 0;
    public DateTime LastAttemptAt { get; set; } = DateTime.UtcNow;

    // SM-2 spaced repetition fields
    public int SrsRepetitions { get; set; } = 0;
    public double SrsEaseFactor { get; set; } = 2.5;
    public int SrsInterval { get; set; } = 1;
    public DateOnly? NextReviewAt { get; set; } = null;

    public User User { get; set; } = null!;
    public Sign Sign { get; set; } = null!;
}
