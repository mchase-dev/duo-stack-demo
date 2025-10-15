namespace DuoStackDemo.DTOs.Responses;

/// <summary>
/// DTO representing complete room data
/// </summary>
public class RoomDto
{
    /// <summary>
    /// Unique identifier for the room
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the room
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// URL-friendly identifier for the room (unique)
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the room is publicly accessible
    /// </summary>
    public bool IsPublic { get; set; }

    /// <summary>
    /// ID of the user who created the room
    /// </summary>
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// User who created the room
    /// </summary>
    public UserDto? Creator { get; set; }

    /// <summary>
    /// Timestamp when the room was created
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
