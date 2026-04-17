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
        foreach (var fileName in new[] { "seed-data.json", "seed-data-extra.json", "seed-data-elix.json" })
            await SeedFileAsync(db, fileName);

        await SeedBadgesAsync(db);
        await SeedPhrasesAsync(db);
    }

    private static async Task SeedBadgesAsync(AppDbContext db)
    {
        var badges = new[]
        {
            new Badge { Slug = "premiere_lecon", Title = "Première leçon",   Description = "Complète ta première leçon.",                  Icon = "🎓" },
            new Badge { Slug = "streak_3",       Title = "3 jours de suite", Description = "Joue 3 jours d'affilée.",                       Icon = "🔥" },
            new Badge { Slug = "streak_7",       Title = "7 jours de suite", Description = "Joue 7 jours d'affilée.",                       Icon = "⚡" },
            new Badge { Slug = "streak_14",      Title = "14 jours de suite",Description = "Joue 14 jours d'affilée.",                      Icon = "📆" },
            new Badge { Slug = "streak_30",      Title = "1 mois intensif",  Description = "Joue 30 jours d'affilée.",                      Icon = "🏆" },
            new Badge { Slug = "xp_100",         Title = "Apprenti",         Description = "Gagne 100 XP au total.",                        Icon = "📚" },
            new Badge { Slug = "xp_500",         Title = "Expert",           Description = "Gagne 500 XP au total.",                        Icon = "🧠" },
            new Badge { Slug = "xp_1000",        Title = "Maître LSF",       Description = "Gagne 1000 XP au total.",                       Icon = "👑" },
            new Badge { Slug = "xp_5000",        Title = "Légende",          Description = "Gagne 5000 XP au total.",                       Icon = "✨" },
            new Badge { Slug = "survie_10",      Title = "Survivant",        Description = "Atteins un score de 10 en mode Survie.",         Icon = "🏃" },
            new Badge { Slug = "survie_20",      Title = "Guerrier",         Description = "Atteins un score de 20 en mode Survie.",         Icon = "⚔️" },
            new Badge { Slug = "survie_50",      Title = "Machine",          Description = "Atteins un score de 50 en mode Survie.",         Icon = "🤖" },
            new Badge { Slug = "quiz_parfait",   Title = "Sans faute",       Description = "Réponds correctement à toutes les questions.",   Icon = "💎" },
            new Badge { Slug = "phrases_5",      Title = "Polyglotte",       Description = "Termine 5 modules de phrases.",                  Icon = "💬" },
            new Badge { Slug = "oiseau_nuit",    Title = "Oiseau de nuit",   Description = "Complète une leçon après minuit.",               Icon = "🦉" }
        };

        foreach (var badge in badges)
        {
            if (!await db.Badges.AnyAsync(b => b.Slug == badge.Slug))
                db.Badges.Add(badge);
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedFileAsync(AppDbContext db, string fileName)
    {
        var jsonPath = Path.Combine(AppContext.BaseDirectory, "Data", fileName);
        if (!File.Exists(jsonPath))
            jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", fileName);
        if (!File.Exists(jsonPath))
            return;

        Console.WriteLine($"[Seeder] Lecture de : {jsonPath}");

        await using var stream = File.OpenRead(jsonPath);
        var entries = await JsonSerializer.DeserializeAsync<List<SeedEntry>>(stream, JsonOptions);
        if (entries is null) return;

        Console.WriteLine($"[Seeder] {entries.Count} entrees dans {fileName}");

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

            // Résout chaque signe : réutilise l'existant si le slug est déjà en base
            var resolvedSigns = new List<Sign>();
            foreach (var s in lessonData.Signs)
            {
                var existing = await db.Signs.FirstOrDefaultAsync(x => x.Slug == s.Slug);
                if (existing is not null)
                {
                    resolvedSigns.Add(existing);
                }
                else
                {
                    var sign = new Sign
                    {
                        Id = Guid.NewGuid(),
                        Word = s.Word,
                        Slug = s.Slug,
                        Definition = s.Definition,
                        ThumbnailUrl = s.ThumbnailUrl,
                        VideoUrl = s.VideoUrl,
                        GifUrl = s.GifUrl,
                        CategoryId = category.Id,
                        Difficulty = lessonData.Difficulty,
                        Tags = lessonData.Tags,
                        IsPublished = true,
                    };
                    db.Signs.Add(sign);
                    await db.SaveChangesAsync();
                    resolvedSigns.Add(sign);
                }
            }

            // N'insère la LessonSign que si elle n'existe pas déjà
            var existingLessonSignIds = await db.LessonSigns
                .Where(ls => ls.LessonId == lesson.Id)
                .Select(ls => ls.SignId)
                .ToListAsync();

            var newLessonSigns = resolvedSigns
                .Select((s, i) => new { Sign = s, Order = i + 1 })
                .Where(x => !existingLessonSignIds.Contains(x.Sign.Id))
                .Select(x => new LessonSign
                {
                    LessonId = lesson.Id,
                    SignId = x.Sign.Id,
                    SortOrder = x.Order,
                })
                .ToList();

            if (newLessonSigns.Count > 0)
            {
                db.LessonSigns.AddRange(newLessonSigns);
                await db.SaveChangesAsync();
            }
        }
    }

    private static async Task SeedPhrasesAsync(AppDbContext db)
    {
        var jsonPath = Path.Combine(AppContext.BaseDirectory, "Data", "seed-phrases.json");
        if (!File.Exists(jsonPath))
            jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "seed-phrases.json");
        if (!File.Exists(jsonPath))
        {
            Console.WriteLine("[Seeder] seed-phrases.json introuvable, skip.");
            return;
        }

        Console.WriteLine($"[Seeder] Lecture de : {jsonPath}");
        await using var stream = File.OpenRead(jsonPath);
        var phraseModules = await JsonSerializer.DeserializeAsync<List<SeedPhraseModule>>(stream, JsonOptions);
        if (phraseModules is null) return;

        // Build a case-insensitive word → Sign lookup from the DB
        var allSigns = await db.Signs.ToListAsync();
        var signByWord = allSigns
            .GroupBy(s => s.Word.ToLowerInvariant())
            .ToDictionary(g => g.Key, g => g.First());

        foreach (var seedModule in phraseModules)
        {
            // Upsert module by title
            var module = await db.Modules.FirstOrDefaultAsync(m => m.Title == seedModule.Module.Title);
            if (module is null)
            {
                module = new Module
                {
                    Title = seedModule.Module.Title,
                    Description = seedModule.Module.Description,
                    Level = (short)seedModule.Module.Level,
                    SortOrder = seedModule.Module.SortOrder,
                    IsPublished = true,
                };
                db.Modules.Add(module);
                await db.SaveChangesAsync();
                Console.WriteLine($"[Seeder-Phrases] Module créé : {module.Title}");
            }

            int lessonOrder = 1;
            foreach (var seedLesson in seedModule.Lessons)
            {
                // Upsert lesson by title + moduleId + LessonType
                var lesson = await db.Lessons.FirstOrDefaultAsync(l =>
                    l.ModuleId == module.Id &&
                    l.Title == seedLesson.Title &&
                    l.LessonType == "phrases");

                if (lesson is null)
                {
                    lesson = new Lesson
                    {
                        Id = Guid.NewGuid(),
                        ModuleId = module.Id,
                        Title = seedLesson.Title,
                        Description = seedLesson.Description,
                        SortOrder = lessonOrder,
                        XpReward = seedLesson.XpReward,
                        LessonType = "phrases",
                        IsPublished = true,
                    };
                    db.Lessons.Add(lesson);
                    await db.SaveChangesAsync();
                    Console.WriteLine($"[Seeder-Phrases] Leçon créée : {lesson.Title}");
                }

                lessonOrder++;

                int phraseOrder = 0;
                foreach (var seedPhrase in seedLesson.Phrases)
                {
                    // Upsert phrase by textFr
                    var phrase = await db.Phrases.FirstOrDefaultAsync(p => p.TextFr == seedPhrase.TextFr);
                    if (phrase is null)
                    {
                        phrase = new Phrase
                        {
                            Id = Guid.NewGuid(),
                            TextFr = seedPhrase.TextFr,
                            TextLsf = seedPhrase.TextLsf,
                            Difficulty = (short)seedPhrase.Difficulty,
                            Tags = seedPhrase.Tags,
                            IsPublished = true,
                        };
                        db.Phrases.Add(phrase);
                        await db.SaveChangesAsync();

                        // Create PhraseSign entries (ordered by position)
                        int position = 0;
                        foreach (var word in seedPhrase.SignWords)
                        {
                            if (signByWord.TryGetValue(word.ToLowerInvariant(), out var sign))
                            {
                                db.PhraseSigns.Add(new PhraseSign
                                {
                                    PhraseId = phrase.Id,
                                    SignId = sign.Id,
                                    Position = position,
                                });
                            }
                            else
                            {
                                Console.WriteLine($"[Seeder-Phrases] Signe introuvable : '{word}' (phrase: {seedPhrase.TextFr})");
                            }
                            position++;
                        }
                        await db.SaveChangesAsync();
                    }

                    // Upsert LessonPhrase link
                    var alreadyLinked = await db.LessonPhrases
                        .AnyAsync(lp => lp.LessonId == lesson.Id && lp.PhraseId == phrase.Id);

                    if (!alreadyLinked)
                    {
                        db.LessonPhrases.Add(new LessonPhrase
                        {
                            LessonId = lesson.Id,
                            PhraseId = phrase.Id,
                            SortOrder = phraseOrder,
                        });
                        await db.SaveChangesAsync();
                    }

                    phraseOrder++;
                }
            }
    }
    // ── FIN Seeder Phrases ────────────────────────────────────────────────────────
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
        public string? VideoUrl { get; set; }
        public string? GifUrl { get; set; }
    }

    // ── DTOs phrases ──────────────────────────────────────────────────────────────

    private sealed class SeedPhraseModule
    {
        public SeedPhraseModuleInfo Module { get; set; } = null!;
        public List<SeedPhraseLesson> Lessons { get; set; } = [];
    }

    private sealed class SeedPhraseModuleInfo
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int Level { get; set; }
        public int SortOrder { get; set; }
    }

    private sealed class SeedPhraseLesson
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public int XpReward { get; set; }
        public List<SeedPhrase> Phrases { get; set; } = [];
    }

    private sealed class SeedPhrase
    {
        public string TextFr { get; set; } = null!;
        public string TextLsf { get; set; } = null!;
        public int Difficulty { get; set; } = 1;
        public string[] Tags { get; set; } = [];
        public string[] SignWords { get; set; } = [];
    }
}
