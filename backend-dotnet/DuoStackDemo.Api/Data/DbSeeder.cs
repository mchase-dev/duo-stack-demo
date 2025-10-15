using DuoStackDemo.Data.Entities;
using DuoStackDemo.Data;
using BCrypt.Net;

namespace DuoStackDemo.Data;

/// <summary>
/// Database seeder for initial data population
/// </summary>
public static class DbSeeder
{
    /// <summary>
    /// Seeds the database with initial data including default Superuser
    /// </summary>
    /// <param name="context">Database context</param>
    public static async Task SeedAsync(AppDbContext context)
    {
        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Check if users already exist
        if (context.Users.Any())
        {
            Console.WriteLine("Database already seeded. Skipping seed operation.");
            return;
        }

        Console.WriteLine("Seeding database with default data...");

        // Create default Superuser
        var superuser = new User
        {
            Id = Guid.NewGuid(),
            Email = "superuser@example.com",
            EmailConfirmed = true,
            Username = "superuser",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("please_change_123", 10),
            FirstName = "Super",
            LastName = "User",
            Role = UserRole.Superuser,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.Add(superuser);
        await context.SaveChangesAsync();

        Console.WriteLine("✅ Database seeded successfully!");
        Console.WriteLine($"   Default Superuser created:");
        Console.WriteLine($"   Email: {superuser.Email}");
        Console.WriteLine($"   Username: {superuser.Username}");
        Console.WriteLine($"   Password: please_change_123");
        Console.WriteLine($"   ⚠️  IMPORTANT: Change this password after first login!");
    }
}
