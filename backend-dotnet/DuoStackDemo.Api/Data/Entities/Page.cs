using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DuoStackDemo.Data.Entities;

/// <summary>
/// Represents a CMS page managed by superusers
/// </summary>
public class Page
{
    /// <summary>
    /// Unique identifier for the page
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Title of the page
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// URL-friendly identifier for the page (unique)
    /// </summary>
    [Required]
    [MaxLength(200)]
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Content of the page (markdown/HTML)
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the page is published
    /// </summary>
    [Required]
    public bool IsPublished { get; set; } = false;

    /// <summary>
    /// ID of the user who created the page
    /// </summary>
    [Required]
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// Timestamp when the page was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the page was last updated
    /// </summary>
    [Required]
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Timestamp when the page was soft deleted (null if not deleted)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// The user who created the page
    /// </summary>
    [ForeignKey(nameof(CreatedBy))]
    public User Creator { get; set; } = null!;
}
