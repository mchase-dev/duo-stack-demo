using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Events.Commands;

/// <summary>
/// Command to create a new event
/// </summary>
public class CreateEventCommand : IRequest<EventDto>
{
    /// <summary>
    /// Event creation request data
    /// </summary>
    public CreateEventRequest Request { get; set; } = null!;

    /// <summary>
    /// Current user ID (event creator)
    /// </summary>
    public Guid UserId { get; set; }
}
