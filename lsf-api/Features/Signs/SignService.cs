using LsfApi.Common;
using LsfApi.Data;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Signs;

public class SignService(AppDbContext db)
{
    public async Task<PagedResult<SignSummaryDto>> GetAllAsync(SignsQueryParams query)
    {
        var q = db.Signs
            .Where(s => s.IsPublished)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
            q = q.Where(s => s.Word.ToLower().Contains(query.Search.ToLower()));

        if (query.CategoryId.HasValue)
            q = q.Where(s => s.CategoryId == query.CategoryId.Value);

        var total = await q.CountAsync();

        var items = await q
            .OrderBy(s => s.Word)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(s => new SignSummaryDto(
                s.Id,
                s.Word,
                s.Slug,
                s.ThumbnailUrl,
                s.Difficulty,
                s.Category!.Name
            ))
            .ToListAsync();

        return new PagedResult<SignSummaryDto>(items, total, query.Page, query.PageSize);
    }

    public async Task<Result<SignDetailDto>> GetBySlugAsync(string slug)
    {
        var sign = await db.Signs
            .Where(s => s.IsPublished && s.Slug == slug)
            .Select(s => new SignDetailDto(
                s.Id,
                s.Word,
                s.Slug,
                s.Definition,
                s.VideoUrl,
                s.GifUrl,
                s.ThumbnailUrl,
                s.Difficulty,
                s.Tags,
                s.CategoryId,
                s.Category!.Name
            ))
            .FirstOrDefaultAsync();

        return sign is null ? Result<SignDetailDto>.Fail(Error.NotFound) : Result<SignDetailDto>.Ok(sign);
    }
}
