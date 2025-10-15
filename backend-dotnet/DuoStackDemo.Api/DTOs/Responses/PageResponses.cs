namespace DuoStackDemo.DTOs.Responses;

/// <summary>
/// DTO representing complete page data
/// </summary>
public class PageDto
{
    /// <summary>
    /// Unique identifier for the page
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the page
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// URL-friendly identifier for the page (unique)
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Content of the page (markdown/HTML)
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the page is published
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// ID of the user who created the page
    /// </summary>
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// User who created the page
    /// </summary>
    public UserDto? Creator { get; set; }

    /// <summary>
    /// Timestamp when the page was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the page was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}
