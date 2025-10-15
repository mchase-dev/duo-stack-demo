/**
 * Base class for integration tests
 * Provides database cleanup between tests
 */

using DuoStackDemo.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DuoStackDemo.Tests;

public abstract class IntegrationTestBase : IClassFixture<TestWebApplicationFactory<Program>>, IAsyncLifetime
{
    protected readonly HttpClient Client;
    protected readonly TestWebApplicationFactory<Program> Factory;

    protected IntegrationTestBase(TestWebApplicationFactory<Program> factory)
    {
        Factory = factory;
        Client = factory.CreateClient();
    }

    public virtual async Task InitializeAsync()
    {
        // Clean database before each test to ensure clean state
        await CleanDatabase();
    }

    public virtual async Task DisposeAsync()
    {
        // Clean up database after each test
        await CleanDatabase();
    }

    private async Task CleanDatabase()
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Use raw SQL to delete all data (bypassing EF tracking and query filters)
        await db.Database.ExecuteSqlRawAsync("DELETE FROM RefreshTokens");
        await db.Database.ExecuteSqlRawAsync("DELETE FROM Messages");
        await db.Database.ExecuteSqlRawAsync("DELETE FROM Events");
        await db.Database.ExecuteSqlRawAsync("DELETE FROM Rooms");
        await db.Database.ExecuteSqlRawAsync("DELETE FROM Pages");
        await db.Database.ExecuteSqlRawAsync("DELETE FROM Users");
    }
}
