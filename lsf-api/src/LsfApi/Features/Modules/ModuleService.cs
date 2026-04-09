using LsfApi.Common;
using LsfApi.Data;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Modules;

public class ModuleService(AppDbContext db)
{
    public async Task<IEnumerable<ModuleDto>> GetAllAsync()
    {
        return await db.Modules
            .Where(m => m.IsPublished)
            .OrderBy(m => m.SortOrder)
            .Select(m => new ModuleDto(
                m.Id,
                m.Title,
                m.Description,
                m.Level,
                m.SortOrder,
                m.Lessons.Count(l => l.IsPublished)
            ))
            .ToListAsync();
    }

    public async Task<Result<ModuleDetailDto>> GetByIdAsync(int id)
    {
        var module = await db.Modules
            .Where(m => m.IsPublished && m.Id == id)
            .Select(m => new ModuleDetailDto(
                m.Id,
                m.Title,
                m.Description,
                m.Level,
                m.SortOrder,
                m.Lessons
                    .Where(l => l.IsPublished)
                    .OrderBy(l => l.SortOrder)
                    .Select(l => new LessonSummaryDto(
                        l.Id,
                        l.Title,
                        l.Description,
                        l.SortOrder,
                        l.XpReward,
                        l.LessonSigns.Count
                    ))
            ))
            .FirstOrDefaultAsync();

        return module is null ? Result<ModuleDetailDto>.Fail(Error.NotFound) : Result<ModuleDetailDto>.Ok(module);
    }
}
