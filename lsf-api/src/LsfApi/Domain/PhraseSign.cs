namespace LsfApi.Domain;

public class PhraseSign
{
    public Guid PhraseId { get; set; }
    public Guid SignId { get; set; }
    public int Position { get; set; } // ordre dans la phrase en LSF (0-indexé)

    public Phrase Phrase { get; set; } = null!;
    public Sign Sign { get; set; } = null!;
}
