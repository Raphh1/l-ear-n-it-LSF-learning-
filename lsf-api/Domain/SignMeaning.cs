namespace LsfApi.Domain;

/// <summary>
/// Un sens du mot d'un signe (source : Elix). Le sens principal contient la vidéo
/// utilisée dans les leçons ; ses autres vidéos sont des variantes (régionales, auteurs).
/// Les autres sens sont des homonymes (ex. « souris » animal / ordinateur).
/// </summary>
public class SignMeaning
{
    public Guid Id { get; set; }
    public Guid SignId { get; set; }
    public int SortOrder { get; set; }
    public bool IsPrimary { get; set; }
    public string? Definition { get; set; }
    public string? DefinitionVideoUrl { get; set; }
    public string? DefinitionThumbnailUrl { get; set; }

    public Sign? Sign { get; set; }
    public ICollection<SignMeaningVideo> Videos { get; set; } = [];
}

public class SignMeaningVideo
{
    public Guid Id { get; set; }
    public Guid MeaningId { get; set; }
    public int SortOrder { get; set; }
    public string VideoUrl { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
    public string? Author { get; set; }

    public SignMeaning? Meaning { get; set; }
}
