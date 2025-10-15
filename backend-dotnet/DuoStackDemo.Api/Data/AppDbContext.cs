using Microsoft.EntityFrameworkCore;
using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.Data;

/// <summary>
/// Database context for the DuoStackDemo application
/// </summary>
public class AppDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the AppDbContext
    /// </summary>
    /// <param name="options">Database context options</param>
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Users in the system
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;

    /// <summary>
    /// Refresh tokens for authentication
    /// </summary>
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;

    /// <summary>
    /// Direct messages between users
    /// </summary>
    public DbSet<Message> Messages { get; set; } = null!;

    /// <summary>
    /// Calendar events
    /// </summary>
    public DbSet<Event> Events { get; set; } = null!;

    /// <summary>
    /// Chat rooms
    /// </summary>
    public DbSet<Room> Rooms { get; set; } = null!;

    /// <summary>
    /// CMS pages
    /// </summary>
    public DbSet<Page> Pages { get; set; } = null!;

    /// <summary>
    /// Configures the model and relationships
    /// </summary>
    /// <param name="modelBuilder">Model builder instance</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.EmailConfirmed)
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.FirstName)
                .HasMaxLength(100);

            entity.Property(e => e.LastName)
                .HasMaxLength(100);

            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20);

            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(500);

            entity.Property(e => e.Role)
                .IsRequired()
                .HasConversion<string>()
                .HasDefaultValue(UserRole.User);

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .IsRequired();

            // Indexes
            entity.HasIndex(e => e.Email)
                .IsUnique();

            entity.HasIndex(e => e.Username)
                .IsUnique();

            entity.HasIndex(e => e.DeletedAt);

            // Query filter for soft delete
            entity.HasQueryFilter(e => e.DeletedAt == null);

            // Seed default superuser account
            // Password: please_change_123 (BCrypt hashed with work factor 10)
            var superuserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            entity.HasData(new User
            {
                Id = superuserId,
                Email = "superuser@example.com",
                EmailConfirmed = true,
                Username = "superuser",
                // BCrypt hash of "please_change_123"
                PasswordHash = "$2b$10$6RukQKCKOZUu0Dn/uICmc.kYh9a3vN4DO6OO4Vuslmq2YNqqULkfG",
                FirstName = "Super",
                LastName = "User",
                Role = UserRole.Superuser,
                CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            });

            // Relationships
            entity.HasMany(e => e.RefreshTokens)
                .WithOne(e => e.User)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.SentMessages)
                .WithOne(e => e.FromUser)
                .HasForeignKey(e => e.FromUserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.ReceivedMessages)
                .WithOne(e => e.ToUser)
                .HasForeignKey(e => e.ToUserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.CreatedEvents)
                .WithOne(e => e.Creator)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.CreatedRooms)
                .WithOne(e => e.Creator)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.CreatedPages)
                .WithOne(e => e.Creator)
                .HasForeignKey(e => e.CreatedBy)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure RefreshToken entity
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.UserId)
                .IsRequired();

            entity.Property(e => e.TokenHash)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.ExpiresAt)
                .IsRequired();

            entity.Property(e => e.Revoked)
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Indexes
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.TokenHash);
            entity.HasIndex(e => e.ExpiresAt);
        });

        // Configure Message entity
        modelBuilder.Entity<Message>(entity =>
        {
            entity.ToTable("Messages");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.FromUserId)
                .IsRequired();

            entity.Property(e => e.ToUserId)
                .IsRequired();

            entity.Property(e => e.Content)
                .IsRequired();

            entity.Property(e => e.IsRead)
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Indexes
            entity.HasIndex(e => e.FromUserId);
            entity.HasIndex(e => e.ToUserId);
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.DeletedAt);

            // Query filter for soft delete
            entity.HasQueryFilter(e => e.DeletedAt == null);
        });

        // Configure Event entity
        modelBuilder.Entity<Event>(entity =>
        {
            entity.ToTable("Events");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.StartTime)
                .IsRequired();

            entity.Property(e => e.EndTime)
                .IsRequired();

            entity.Property(e => e.Visibility)
                .IsRequired()
                .HasConversion<string>();

            entity.Property(e => e.CreatedBy)
                .IsRequired();

            entity.Property(e => e.Color)
                .HasMaxLength(20);

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .IsRequired();

            // Indexes
            entity.HasIndex(e => e.CreatedBy);
            entity.HasIndex(e => e.StartTime);
            entity.HasIndex(e => e.EndTime);
            entity.HasIndex(e => e.Visibility);
            entity.HasIndex(e => e.DeletedAt);

            // Query filter for soft delete
            entity.HasQueryFilter(e => e.DeletedAt == null);
        });

        // Configure Room entity
        modelBuilder.Entity<Room>(entity =>
        {
            entity.ToTable("Rooms");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.IsPublic)
                .IsRequired()
                .HasDefaultValue(true);

            entity.Property(e => e.CreatedBy)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            // Indexes
            entity.HasIndex(e => e.Slug)
                .IsUnique();

            entity.HasIndex(e => e.CreatedBy);
            entity.HasIndex(e => e.DeletedAt);

            // Query filter for soft delete
            entity.HasQueryFilter(e => e.DeletedAt == null);
        });

        // Configure Page entity
        modelBuilder.Entity<Page>(entity =>
        {
            entity.ToTable("Pages");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.Title)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Slug)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Content)
                .IsRequired();

            entity.Property(e => e.IsPublished)
                .IsRequired()
                .HasDefaultValue(false);

            entity.Property(e => e.CreatedBy)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            entity.Property(e => e.UpdatedAt)
                .IsRequired();

            // Indexes
            entity.HasIndex(e => e.Slug)
                .IsUnique();

            entity.HasIndex(e => e.IsPublished);
            entity.HasIndex(e => e.CreatedBy);
            entity.HasIndex(e => e.DeletedAt);

            // Query filter for soft delete
            entity.HasQueryFilter(e => e.DeletedAt == null);
        });
    }

    /// <summary>
    /// Saves changes to the database, automatically updating timestamps
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of state entries written to the database</returns>
    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                // Set CreatedAt if the entity has this property
                var createdAtProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "CreatedAt");
                if (createdAtProperty != null &&
                    (createdAtProperty.CurrentValue == null || (DateTime)createdAtProperty.CurrentValue == default))
                {
                    createdAtProperty.CurrentValue = DateTime.UtcNow;
                }
            }

            // Set UpdatedAt if the entity has this property
            var updatedAtProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "UpdatedAt");
            if (updatedAtProperty != null)
            {
                updatedAtProperty.CurrentValue = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
