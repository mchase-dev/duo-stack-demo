using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Represents a refresh token for JWT authentication
/// </summary>
public class RefreshToken
{
    /// <summary>
    /// Unique identifier for the refresh token
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the user this token belongs to
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Hashed refresh token value
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string TokenHash { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the token expires
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Indicates whether the token has been revoked
    /// </summary>
    [Required]
    public bool Revoked { get; set; } = false;

    /// <summary>
    /// Timestamp when the token was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// The user this token belongs to
    /// </summary>
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
