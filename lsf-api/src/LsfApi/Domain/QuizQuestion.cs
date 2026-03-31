namespace LsfApi.Domain;

public class QuizQuestion
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public Guid SignId { get; set; }
    public int SortOrder { get; set; }

    public Quiz? Quiz { get; set; }
    public Sign? Sign { get; set; }
}
