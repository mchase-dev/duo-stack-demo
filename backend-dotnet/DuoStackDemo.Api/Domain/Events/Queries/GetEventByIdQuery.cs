using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Events.Queries;

/// <summary>
/// Query to get a single event by ID
/// </summary>
public class GetEventByIdQuery : IRequest<EventDto>
{
    /// <summary>
    /// Event ID to retrieve
    /// </summary>
    public Guid EventId { get; set; }

    /// <summary>
    /// Current user ID for permission filtering
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Current user role for permission filtering
    /// </summary>
    public UserRole UserRole { get; set; }
}
