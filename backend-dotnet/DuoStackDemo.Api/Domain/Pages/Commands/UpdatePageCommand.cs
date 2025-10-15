using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Commands;

/// <summary>
/// Command to update an existing CMS page (Superuser only)
/// </summary>
public class UpdatePageCommand : IRequest<PageDto>
{
    /// <summary>
    /// Page ID to update
    /// </summary>
    public Guid PageId { get; set; }

    /// <summary>
    /// Page update request data
    /// </summary>
    public UpdatePageRequest Request { get; set; } = null!;
}
