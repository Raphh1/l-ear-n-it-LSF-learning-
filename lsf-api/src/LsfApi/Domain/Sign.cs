namespace LsfApi.Domain;

public class Sign
{
    public Guid Id { get; set; }
    public string Word { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Definition { get; set; }
    public string? VideoUrl { get; set; }
    public string? GifUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int CategoryId { get; set; }
    public short Difficulty { get; set; } = 1;
    public string[] Tags { get; set; } = [];
    public bool IsPublished { get; set; } = false;

    public Category? Category { get; set; }
    public ICollection<LessonSign> LessonSigns { get; set; } = [];
    public ICollection<QuizQuestion> QuizQuestions { get; set; } = [];
}
