using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Represents a chat room
/// </summary>
public class Room
{
    /// <summary>
    /// Unique identifier for the room
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the room
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// URL-friendly identifier for the room (unique)
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the room is publicly accessible
    /// </summary>
    [Required]
    public bool IsPublic { get; set; } = true;

    /// <summary>
    /// ID of the user who created the room
    /// </summary>
    [Required]
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// Timestamp when the room was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the room was soft deleted (null if not deleted)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// The user who created the room
    /// </summary>
    [ForeignKey(nameof(CreatedBy))]
    public User Creator { get; set; } = null!;
}
