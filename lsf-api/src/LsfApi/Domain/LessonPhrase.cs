namespace LsfApi.Domain;

public class LessonPhrase
{
    public Guid LessonId { get; set; }
    public Guid PhraseId { get; set; }
    public int SortOrder { get; set; }

    public Lesson Lesson { get; set; } = null!;
    public Phrase Phrase { get; set; } = null!;
}
