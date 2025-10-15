using MediatR;

namespace DuoStackDemo.Domain.Pages.Commands;

/// <summary>
/// Command to soft delete a CMS page (Superuser only)
/// </summary>
public class DeletePageCommand : IRequest
{
    /// <summary>
    /// Page ID to delete
    /// </summary>
    public Guid PageId { get; set; }
}
