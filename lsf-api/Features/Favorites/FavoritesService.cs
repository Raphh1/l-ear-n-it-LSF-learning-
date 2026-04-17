using LsfApi.Data;
using LsfApi.Domain;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Features.Favorites;

public class FavoritesService(AppDbContext db)
{
    public async Task<List<FavoriteSignDto>> GetAllAsync(Guid userId)
    {
        return await db.UserFavorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FavoriteSignDto(
                f.Sign!.Id,
                f.Sign.Word,
                f.Sign.Slug,
                f.Sign.ThumbnailUrl,
                f.Sign.Difficulty,
                f.Sign.Category!.Name,
                f.CreatedAt))
            .ToListAsync();
    }

    public async Task<List<Guid>> GetIdsAsync(Guid userId)
    {
        return await db.UserFavorites
            .Where(f => f.UserId == userId)
            .Select(f => f.SignId)
            .ToListAsync();
    }

    public async Task AddAsync(Guid userId, Guid signId)
    {
        var exists = await db.UserFavorites.AnyAsync(f => f.UserId == userId && f.SignId == signId);
        if (exists) return;

        db.UserFavorites.Add(new UserFavorite { UserId = userId, SignId = signId });
        await db.SaveChangesAsync();
    }

    public async Task RemoveAsync(Guid userId, Guid signId)
    {
        var fav = await db.UserFavorites.FindAsync(userId, signId);
        if (fav is null) return;

        db.UserFavorites.Remove(fav);
        await db.SaveChangesAsync();
    }
}
