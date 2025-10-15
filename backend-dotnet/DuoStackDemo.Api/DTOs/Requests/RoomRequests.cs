using System.ComponentModel.DataAnnotations;

namespace DuoStackDemo.DTOs.Requests;

/// <summary>
/// Request DTO for creating a new room
/// </summary>
public class CreateRoomRequest
{
    /// <summary>
    /// Name of the room
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the room is publicly accessible
    /// </summary>
    [Required(ErrorMessage = "IsPublic is required")]
    public bool IsPublic { get; set; } = true;
}

/// <summary>
/// Request DTO for updating a room
/// </summary>
public class UpdateRoomRequest
{
    /// <summary>
    /// Name of the room (optional)
    /// </summary>
    [MaxLength(100)]
    public string? Name { get; set; }

    /// <summary>
    /// Indicates whether the room is publicly accessible (optional)
    /// </summary>
    public bool? IsPublic { get; set; }
}
