namespace LsfApi.Domain;

public class LessonSign
{
    public Guid LessonId { get; set; }
    public Guid SignId { get; set; }
    public int SortOrder { get; set; }

    public Lesson? Lesson { get; set; }
    public Sign? Sign { get; set; }
}
