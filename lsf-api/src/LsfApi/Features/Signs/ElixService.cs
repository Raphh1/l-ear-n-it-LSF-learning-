using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace LsfApi.Features.Signs;

public class ElixService(HttpClient httpClient)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    public async Task<ElixWordResultDto?> GetVideosAsync(string word)
    {
        var response = await httpClient.GetAsync($"words?q={Uri.EscapeDataString(word)}");

        if (!response.IsSuccessStatusCode)
            return null;

        var elixResponse = await response.Content.ReadFromJsonAsync<ElixApiResponse>(JsonOptions);
        var elixWords = elixResponse?.Data;

        if (elixWords is null || elixWords.Count == 0)
            return null;

        // On prend le premier mot qui a des signes vidéo
        var bestMatch = elixWords
            .FirstOrDefault(w => w.Meanings.Any(m => m.WordSigns.Count > 0))
            ?? elixWords[0];

        var firstMeaning = bestMatch.Meanings.FirstOrDefault();

        var videos = bestMatch.Meanings
            .SelectMany(m => m.WordSigns)
            .Select(s => new ElixSignVideoDto(s.Uri, s.Image, s.Author))
            .ToList();

        return new ElixWordResultDto(
            Word: bestMatch.Name,
            Definition: firstMeaning?.Definition,
            Videos: videos
        );
    }
}
