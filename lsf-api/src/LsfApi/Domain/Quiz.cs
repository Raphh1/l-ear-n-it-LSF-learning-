namespace LsfApi.Domain;

public class Quiz
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid? LessonId { get; set; }
    public string QuizType { get; set; } = "sign_to_word"; // "sign_to_word" | "word_to_sign"

    public Lesson? Lesson { get; set; }
    public ICollection<QuizQuestion> Questions { get; set; } = [];
    public ICollection<QuizAttempt> Attempts { get; set; } = [];
}
