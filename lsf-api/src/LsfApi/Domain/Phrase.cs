namespace LsfApi.Domain;

public class Phrase
{
    public Guid Id { get; set; }
    public string TextFr { get; set; } = string.Empty;   // ex: "Tu veux du café ?"
    public string TextLsf { get; set; } = string.Empty;  // gloss LSF : "CAFÉ TU VOULOIR"
    public string? VideoUrl { get; set; }
    public string? GifUrl { get; set; }
    public short Difficulty { get; set; } = 1;
    public string[] Tags { get; set; } = [];
    public bool IsPublished { get; set; } = false;

    public ICollection<PhraseSign> PhraseSigns { get; set; } = [];
    public ICollection<LessonPhrase> LessonPhrases { get; set; } = [];
}
