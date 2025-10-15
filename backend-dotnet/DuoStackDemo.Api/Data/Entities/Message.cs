using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Represents a direct message between users
/// </summary>
public class Message
{
    /// <summary>
    /// Unique identifier for the message
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// ID of the user who sent the message
    /// </summary>
    [Required]
    public Guid FromUserId { get; set; }

    /// <summary>
    /// ID of the user who receives the message
    /// </summary>
    [Required]
    public Guid ToUserId { get; set; }

    /// <summary>
    /// Content of the message
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the message has been read
    /// </summary>
    [Required]
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// Timestamp when the message was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the message was soft deleted (null if not deleted)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// The user who sent the message
    /// </summary>
    [ForeignKey(nameof(FromUserId))]
    public User FromUser { get; set; } = null!;

    /// <summary>
    /// The user who receives the message
    /// </summary>
    [ForeignKey(nameof(ToUserId))]
    public User ToUser { get; set; } = null!;
}
