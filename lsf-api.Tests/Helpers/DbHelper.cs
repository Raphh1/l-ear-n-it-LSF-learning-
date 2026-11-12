using LsfApi.Data;
using Microsoft.EntityFrameworkCore;

namespace LsfApi.Tests.Helpers;

public static class DbHelper
{
    public static AppDbContext CreateDb(string? name = null)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(name ?? Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }
}
