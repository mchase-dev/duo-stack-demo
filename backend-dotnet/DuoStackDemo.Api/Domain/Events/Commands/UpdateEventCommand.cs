using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Events.Commands;

/// <summary>
/// Command to update an existing event
/// </summary>
public class UpdateEventCommand : IRequest<EventDto>
{
    /// <summary>
    /// Event ID to update
    /// </summary>
    public Guid EventId { get; set; }

    /// <summary>
    /// Event update request data
    /// </summary>
    public UpdateEventRequest Request { get; set; } = null!;

    /// <summary>
    /// Current user ID for permission check
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Current user role for permission check
    /// </summary>
    public UserRole UserRole { get; set; }
}
