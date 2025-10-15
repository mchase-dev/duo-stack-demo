using MediatR;
using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.Domain.Events.Commands;

/// <summary>
/// Command to soft delete an event
/// </summary>
public class DeleteEventCommand : IRequest
{
    /// <summary>
    /// Event ID to delete
    /// </summary>
    public Guid EventId { get; set; }

    /// <summary>
    /// Current user ID for permission check
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Current user role for permission check
    /// </summary>
    public UserRole UserRole { get; set; }
}
