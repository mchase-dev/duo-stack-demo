using System.ComponentModel.DataAnnotations;

namespace DuoStackDemo.DTOs.Requests;

/// <summary>
/// Request DTO for creating a new page
/// </summary>
public class CreatePageRequest
{
    /// <summary>
    /// Title of the page
    /// </summary>
    [Required(ErrorMessage = "Title is required")]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// URL-friendly identifier for the page (optional, auto-generated from title if not provided)
    /// </summary>
    [MaxLength(200)]
    public string? Slug { get; set; }

    /// <summary>
    /// Content of the page (markdown/HTML)
    /// </summary>
    [Required(ErrorMessage = "Content is required")]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the page is published (optional, defaults to false)
    /// </summary>
    public bool? IsPublished { get; set; }
}

/// <summary>
/// Request DTO for updating a page
/// </summary>
public class UpdatePageRequest
{
    /// <summary>
    /// Title of the page (optional)
    /// </summary>
    [MaxLength(200)]
    public string? Title { get; set; }

    /// <summary>
    /// URL-friendly identifier for the page (optional)
    /// </summary>
    [MaxLength(200)]
    public string? Slug { get; set; }

    /// <summary>
    /// Content of the page (markdown/HTML, optional)
    /// </summary>
    public string? Content { get; set; }

    /// <summary>
    /// Indicates whether the page is published (optional)
    /// </summary>
    public bool? IsPublished { get; set; }
}
