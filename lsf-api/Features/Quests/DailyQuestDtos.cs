namespace LsfApi.Features.Quests;

public record DailyQuestDto(
    string QuestType,
    string Label,
    int TargetValue,
    int CurrentValue,
    bool IsCompleted,
    int XpReward
);

public record QuestProgressRequest(string QuestType, int Amount);
