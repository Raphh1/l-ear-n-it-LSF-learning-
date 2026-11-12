using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Quests;

public class DailyQuestService(AppDbContext db)
{
    private static readonly (string Type, string Label, int Target, int XpReward)[] QuestDefinitions =
    [
        ("review_signs",     "Réviser 10 signes",      10, 30),
        ("play_game",        "Jouer 1 partie",          1,  20),
        ("daily_challenge",  "Faire le défi du jour",   1,  25),
    ];

    public async Task<List<DailyQuestDto>> GetOrCreateTodayQuestsAsync(Guid userId)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var existing = await db.UserDailyQuests
            .Where(q => q.UserId == userId && q.Date == today)
            .ToListAsync();

        if (existing.Count == 0)
        {
            foreach (var (type, _, target, xpReward) in QuestDefinitions)
            {
                db.UserDailyQuests.Add(new UserDailyQuest
                {
                    UserId = userId,
                    Date = today,
                    QuestType = type,
                    TargetValue = target,
                    XpReward = xpReward,
                });
            }
            await db.SaveChangesAsync();

            existing = await db.UserDailyQuests
                .Where(q => q.UserId == userId && q.Date == today)
                .ToListAsync();
        }

        return existing.Select(q => ToDto(q)).ToList();
    }

    public async Task IncrementQuestAsync(Guid userId, string questType, int amount = 1)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var quest = await db.UserDailyQuests
            .FirstOrDefaultAsync(q => q.UserId == userId && q.Date == today && q.QuestType == questType);

        if (quest is null || quest.IsCompleted) return;

        quest.CurrentValue = Math.Min(quest.CurrentValue + amount, quest.TargetValue);

        if (quest.CurrentValue >= quest.TargetValue)
        {
            quest.IsCompleted = true;
            quest.CompletedAt = DateTime.UtcNow;

            var progress = await db.UserProgress.FindAsync(userId);
            if (progress is not null)
                progress.XpTotal += quest.XpReward;
        }

        await db.SaveChangesAsync();
    }

    private static DailyQuestDto ToDto(UserDailyQuest q)
    {
        var label = QuestDefinitions.FirstOrDefault(d => d.Type == q.QuestType).Label ?? q.QuestType;
        return new DailyQuestDto(q.QuestType, label, q.TargetValue, q.CurrentValue, q.IsCompleted, q.XpReward);
    }
}
