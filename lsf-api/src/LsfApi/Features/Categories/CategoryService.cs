using LsfApi.Data;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Categories;

public class CategoryService(AppDbContext db)
{
    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        return await db.Categories
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.IconUrl,
                c.SortOrder,
                c.Signs.Count(s => s.IsPublished)
            ))
            .ToListAsync();
            
    }
}
