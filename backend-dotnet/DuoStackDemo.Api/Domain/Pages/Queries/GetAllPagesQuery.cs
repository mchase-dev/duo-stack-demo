using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Queries;

/// <summary>
/// Query to get all CMS pages
/// </summary>
public class GetAllPagesQuery : IRequest<List<PageDto>>
{
    /// <summary>
    /// Whether to include unpublished pages (Superuser only)
    /// </summary>
    public bool IncludeUnpublished { get; set; }
}
