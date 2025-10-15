using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.DTOs.Responses;

/// <summary>
/// DTO representing complete event data
/// </summary>
public class EventDto
{
    /// <summary>
    /// Unique identifier for the event
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the event
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Description of the event
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Start time of the event
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// End time of the event
    /// </summary>
    public DateTime EndTime { get; set; }

    /// <summary>
    /// Visibility level of the event
    /// </summary>
    public EventVisibility Visibility { get; set; }

    /// <summary>
    /// Array of user IDs allowed to view restricted events
    /// </summary>
    public List<Guid>? AllowedUserIds { get; set; }

    /// <summary>
    /// ID of the user who created the event
    /// </summary>
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// Username of the user who created the event
    /// </summary>
    public string CreatorUsername { get; set; } = string.Empty;

    /// <summary>
    /// Color code for the event (hex format)
    /// </summary>
    public string? Color { get; set; }

    /// <summary>
    /// Location of the event
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Timestamp when the event was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the event was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
