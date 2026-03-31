namespace LsfApi.Domain;

public class Lesson
{
    public Guid Id { get; set; }
    public int ModuleId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public int XpReward { get; set; } = 10;
    public bool IsPublished { get; set; } = false;

    public Module? Module { get; set; }
    public ICollection<LessonSign> LessonSigns { get; set; } = [];
    public ICollection<UserLessonCompletion> UserCompletions { get; set; } = [];
    public ICollection<Quiz> Quizzes { get; set; } = [];
}
