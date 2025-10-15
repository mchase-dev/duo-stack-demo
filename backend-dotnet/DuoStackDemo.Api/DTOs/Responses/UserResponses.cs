using System.ComponentModel.DataAnnotations;

namespace DuoStackDemo.DTOs.Responses;

/// <summary>
/// Response DTO for paginated users list
/// </summary>
public class UsersListResponse
{
    /// <summary>
    /// Array of users
    /// </summary>
    [Required]
    public List<UserDto> Items { get; set; } = new();

    /// <summary>
    /// Total number of users matching the query
    /// </summary>
    public int Total { get; set; }

    /// <summary>
    /// Current page number (1-based)
    /// </summary>
    public int Page { get; set; }

    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; set; }
}
