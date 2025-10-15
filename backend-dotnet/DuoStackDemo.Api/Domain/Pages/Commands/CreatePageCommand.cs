using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Commands;

/// <summary>
/// Command to create a new CMS page (Superuser only)
/// </summary>
public class CreatePageCommand : IRequest<PageDto>
{
    /// <summary>
    /// Page creation request data
    /// </summary>
    public CreatePageRequest Request { get; set; } = null!;

    /// <summary>
    /// Current user ID (page creator)
    /// </summary>
    public Guid CreatedBy { get; set; }
}
