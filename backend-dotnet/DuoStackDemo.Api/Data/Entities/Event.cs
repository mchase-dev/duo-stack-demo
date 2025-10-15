using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Represents a calendar event
/// </summary>
public class Event
{
    /// <summary>
    /// Unique identifier for the event
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the event
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Description of the event
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Start time of the event
    /// </summary>
    [Required]
    public DateTime StartTime { get; set; }

    /// <summary>
    /// End time of the event
    /// </summary>
    [Required]
    public DateTime EndTime { get; set; }

    /// <summary>
    /// Visibility level of the event
    /// </summary>
    [Required]
    public EventVisibility Visibility { get; set; }

    /// <summary>
    /// JSON array of user IDs allowed to view restricted events
    /// </summary>
    public string? AllowedUserIds { get; set; }

    /// <summary>
    /// ID of the user who created the event
    /// </summary>
    [Required]
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// Color code for the event (hex format)
    /// </summary>
    [MaxLength(20)]
    public string? Color { get; set; }

    /// <summary>
    /// Location of the event
    /// </summary>
    [MaxLength(200)]
    public string? Location { get; set; }

    /// <summary>
    /// Timestamp when the event was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the event was last updated
    /// </summary>
    [Required]
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Timestamp when the event was soft deleted (null if not deleted)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// The user who created the event
    /// </summary>
    [ForeignKey(nameof(CreatedBy))]
    public User Creator { get; set; } = null!;
}
