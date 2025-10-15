using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Events.Queries;

/// <summary>
/// Query to get events filtered by date range and visibility
/// </summary>
public class GetEventsQuery : IRequest<List<EventDto>>
{
    /// <summary>
    /// Start date filter
    /// </summary>
    public DateTime? From { get; set; }

    /// <summary>
    /// End date filter
    /// </summary>
    public DateTime? To { get; set; }

    /// <summary>
    /// Visibility filter
    /// </summary>
    public EventVisibility? Visibility { get; set; }

    /// <summary>
    /// Current user ID for permission filtering
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Current user role for permission filtering
    /// </summary>
    public UserRole UserRole { get; set; }
}
