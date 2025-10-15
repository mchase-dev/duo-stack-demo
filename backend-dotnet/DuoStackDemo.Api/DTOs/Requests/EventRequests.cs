using System.ComponentModel.DataAnnotations;
using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.DTOs.Requests;

/// <summary>
/// Request DTO for creating a new event
/// </summary>
public class CreateEventRequest
{
    /// <summary>
    /// Title of the event
    /// </summary>
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Description of the event (optional)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Start time of the event
    /// </summary>
    [Required(ErrorMessage = "StartTime is required")]
    public DateTime StartTime { get; set; }

    /// <summary>
    /// End time of the event
    /// </summary>
    [Required(ErrorMessage = "EndTime is required")]
    public DateTime EndTime { get; set; }

    /// <summary>
    /// Visibility level of the event
    /// </summary>
    [Required(ErrorMessage = "Visibility is required")]
    public EventVisibility Visibility { get; set; }

    /// <summary>
    /// Array of user IDs allowed to view restricted events (optional)
    /// </summary>
    public List<Guid>? AllowedUserIds { get; set; }

    /// <summary>
    /// Color code for the event (hex format, optional)
    /// </summary>
    [MaxLength(20)]
    public string? Color { get; set; }

    /// <summary>
    /// Location of the event (optional)
    /// </summary>
    [MaxLength(200)]
    public string? Location { get; set; }
}

/// <summary>
/// Request DTO for updating an event
/// </summary>
public class UpdateEventRequest
{
    /// <summary>
    /// Title of the event (optional)
    /// </summary>
    [MaxLength(200)]
    public string? Title { get; set; }

    /// <summary>
    /// Description of the event (optional)
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Start time of the event (optional)
    /// </summary>
    public DateTime? StartTime { get; set; }

    /// <summary>
    /// End time of the event (optional)
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Visibility level of the event (optional)
    /// </summary>
    public EventVisibility? Visibility { get; set; }

    /// <summary>
    /// Array of user IDs allowed to view restricted events (optional)
    /// </summary>
    public List<Guid>? AllowedUserIds { get; set; }

    /// <summary>
    /// Color code for the event (hex format, optional)
    /// </summary>
    [MaxLength(20)]
    public string? Color { get; set; }

    /// <summary>
    /// Location of the event (optional)
    /// </summary>
    [MaxLength(200)]
    public string? Location { get; set; }
}
