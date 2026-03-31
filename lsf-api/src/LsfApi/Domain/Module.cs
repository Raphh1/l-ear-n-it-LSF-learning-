namespace LsfApi.Domain;

public class Module
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public short Level { get; set; } = 1;
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; } = false;

    public ICollection<Lesson> Lessons { get; set; } = [];
}
