using System.Text.Json;
using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Data;

public static class DatabaseSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public static async Task SeedAsync(AppDbContext db)
    {
        var jsonPath = Path.Combine(AppContext.BaseDirectory, "Data", "seed-data.json");
        if (!File.Exists(jsonPath))
            jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "seed-data.json");
        if (!File.Exists(jsonPath))
        {
            Console.WriteLine($"[Seeder] seed-data.json introuvable. Chemins essayés : {AppContext.BaseDirectory}/Data et {Directory.GetCurrentDirectory()}/Data");
            return;
        }

        Console.WriteLine($"[Seeder] Lecture de : {jsonPath}");

        await using var stream = File.OpenRead(jsonPath);
        var entries = await JsonSerializer.DeserializeAsync<List<SeedEntry>>(stream, JsonOptions);
        if (entries is null) { Console.WriteLine("[Seeder] Désérialisation échouée (null)"); return; }

        Console.WriteLine($"[Seeder] {entries.Count} entrées trouvées dans le JSON");

        foreach (var entry in entries)
            await SeedEntryAsync(db, entry);
    }

    private static async Task SeedEntryAsync(AppDbContext db, SeedEntry entry)
    {
        if (await db.Categories.AnyAsync(c => c.Slug == entry.Category.Slug))
            return;

        var category = new Category
        {
            Name = entry.Category.Name,
            Slug = entry.Category.Slug,
            SortOrder = entry.Category.SortOrder,
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync();

        var module = new Module
        {
            Title = entry.Module.Title,
            Description = entry.Module.Description,
            Level = (short)entry.Module.Level,
            SortOrder = entry.Module.SortOrder,
            IsPublished = true,
        };
        db.Modules.Add(module);
        await db.SaveChangesAsync();

        foreach (var lessonData in entry.Lessons)
        {
            var lesson = new Lesson
            {
                Id = Guid.NewGuid(),
                ModuleId = module.Id,
                Title = lessonData.Title,
                Description = lessonData.Description,
                SortOrder = lessonData.SortOrder,
                XpReward = lessonData.XpReward,
                IsPublished = true,
            };
            db.Lessons.Add(lesson);
            await db.SaveChangesAsync();

            var signs = lessonData.Signs.Select(s => new Sign
            {
                Id = Guid.NewGuid(),
                Word = s.Word,
                Slug = s.Slug,
                Definition = s.Definition,
                ThumbnailUrl = s.ThumbnailUrl,
                CategoryId = category.Id,
                Difficulty = lessonData.Difficulty,
                Tags = lessonData.Tags,
                IsPublished = true,
            }).ToList();

            db.Signs.AddRange(signs);
            await db.SaveChangesAsync();

            db.LessonSigns.AddRange(signs.Select((s, i) => new LessonSign
            {
                LessonId = lesson.Id,
                SignId = s.Id,
                SortOrder = i + 1,
            }));
            await db.SaveChangesAsync();
        }
    }

    // ── DTOs de désérialisation ───────────────────────────────────────────────────

    private sealed class SeedEntry
    {
        public SeedCategory Category { get; set; } = null!;
        public SeedModule Module { get; set; } = null!;
        public List<SeedLesson> Lessons { get; set; } = [];
    }

    private sealed class SeedCategory
    {
        public string Name { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public int SortOrder { get; set; }
    }

    private sealed class SeedModule
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int Level { get; set; }
        public int SortOrder { get; set; }
    }

    private sealed class SeedLesson
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int SortOrder { get; set; }
        public int XpReward { get; set; }
        public string[] Tags { get; set; } = [];
        public short Difficulty { get; set; }
        public List<SeedSign> Signs { get; set; } = [];
    }

    private sealed class SeedSign
    {
        public string Word { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public string? Definition { get; set; }
        public string? ThumbnailUrl { get; set; }
    }
}
