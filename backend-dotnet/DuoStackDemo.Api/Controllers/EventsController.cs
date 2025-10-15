using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Events.Commands;
using DuoStackDemo.Domain.Events.Queries;
using System.Security.Claims;

namespace DuoStackDemo.Controllers;

/// <summary>
/// Controller for calendar event operations
/// </summary>
[ApiController]
[Route("api/v1/events")]
[Authorize]
public class EventsController : ControllerBase
{
    private readonly IMediator _mediator;

    public EventsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return Guid.Parse(userIdClaim!);
    }

    private UserRole GetCurrentUserRole()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        // Case-insensitive enum parsing
        return Enum.TryParse<UserRole>(roleClaim, ignoreCase: true, out var role) ? role : UserRole.User;
    }

    /// <summary>
    /// Get events filtered by date range and visibility
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<EventDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetEvents(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] EventVisibility? visibility)
    {
        try
        {
            var query = new GetEventsQuery
            {
                From = from,
                To = to,
                Visibility = visibility,
                UserId = GetCurrentUserId(),
                UserRole = GetCurrentUserRole()
            };

            var events = await _mediator.Send(query);
            return Ok(ApiResponse<List<EventDto>>.Ok(events));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving events"));
        }
    }

    /// <summary>
    /// Create new event
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<EventDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CreateEvent([FromBody] CreateEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new CreateEventCommand
            {
                Request = request,
                UserId = GetCurrentUserId()
            };

            var eventDto = await _mediator.Send(command);
            return StatusCode(201, ApiResponse<EventDto>.Ok(eventDto));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while creating event"));
        }
    }

    /// <summary>
    /// Get event by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EventDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetEventById(Guid id)
    {
        try
        {
            var query = new GetEventByIdQuery
            {
                EventId = id,
                UserId = GetCurrentUserId(),
                UserRole = GetCurrentUserRole()
            };

            var eventDto = await _mediator.Send(query);
            return Ok(ApiResponse<EventDto>.Ok(eventDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Event not found"));
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, ApiErrorResponse.CreateError("Insufficient permissions to view this event"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving event"));
        }
    }

    /// <summary>
    /// Update event (owner/Admin/Superuser)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EventDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateEvent(Guid id, [FromBody] UpdateEventRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new UpdateEventCommand
            {
                EventId = id,
                Request = request,
                UserId = GetCurrentUserId(),
                UserRole = GetCurrentUserRole()
            };

            var eventDto = await _mediator.Send(command);
            return Ok(ApiResponse<EventDto>.Ok(eventDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Event not found"));
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, ApiErrorResponse.CreateError("Insufficient permissions to update this event"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while updating event"));
        }
    }

    /// <summary>
    /// Soft delete event (owner/Admin/Superuser)
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteEvent(Guid id)
    {
        try
        {
            var command = new DeleteEventCommand
            {
                EventId = id,
                UserId = GetCurrentUserId(),
                UserRole = GetCurrentUserRole()
            };

            await _mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { message = "Event deleted successfully" }));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Event not found"));
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, ApiErrorResponse.CreateError("Insufficient permissions to delete this event"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while deleting event"));
        }
    }
}
