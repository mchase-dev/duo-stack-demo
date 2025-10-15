using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Queries;

/// <summary>
/// Query to get a page by slug
/// </summary>
public class GetPageBySlugQuery : IRequest<PageDto>
{
    /// <summary>
    /// Page slug
    /// </summary>
    public string Slug { get; set; } = string.Empty;

    /// <summary>
    /// Whether to include unpublished pages (Superuser only)
    /// </summary>
    public bool IncludeUnpublished { get; set; }
}
