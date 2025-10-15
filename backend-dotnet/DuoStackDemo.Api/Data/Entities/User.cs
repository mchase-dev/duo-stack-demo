using System.ComponentModel.DataAnnotations;

namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Represents a user account in the system
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// User's email address (unique)
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the user's email has been confirmed
    /// </summary>
    [Required]
    public bool EmailConfirmed { get; set; } = false;

    /// <summary>
    /// User's unique username
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password (bcrypt)
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// User's first name
    /// </summary>
    [MaxLength(100)]
    public string? FirstName { get; set; }

    /// <summary>
    /// User's last name
    /// </summary>
    [MaxLength(100)]
    public string? LastName { get; set; }

    /// <summary>
    /// User's phone number
    /// </summary>
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// URL to user's avatar image
    /// </summary>
    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// User's biography text
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// User's role in the system
    /// </summary>
    [Required]
    public UserRole Role { get; set; } = UserRole.User;

    /// <summary>
    /// Timestamp when the user was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the user was last updated
    /// </summary>
    [Required]
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Timestamp when the user was soft deleted (null if not deleted)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// Refresh tokens associated with this user
    /// </summary>
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    /// <summary>
    /// Messages sent by this user
    /// </summary>
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();

    /// <summary>
    /// Messages received by this user
    /// </summary>
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();

    /// <summary>
    /// Events created by this user
    /// </summary>
    public ICollection<Event> CreatedEvents { get; set; } = new List<Event>();

    /// <summary>
    /// Rooms created by this user
    /// </summary>
    public ICollection<Room> CreatedRooms { get; set; } = new List<Room>();

    /// <summary>
    /// Pages created by this user
    /// </summary>
    public ICollection<Page> CreatedPages { get; set; } = new List<Page>();
}
