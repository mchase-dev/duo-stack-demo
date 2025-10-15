using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Rooms.Queries;
using DuoStackDemo.Domain.Rooms.Commands;

namespace DuoStackDemo.Controllers;

/// <summary>
/// Controller for chat room operations
/// </summary>
[ApiController]
[Route("api/v1/rooms")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get all rooms
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<RoomDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetAllRooms()
    {
        try
        {
            var query = new GetAllRoomsQuery();
            var rooms = await _mediator.Send(query);
            return Ok(ApiResponse<List<RoomDto>>.Ok(rooms));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving rooms"));
        }
    }

    /// <summary>
    /// Create new room (Admin+ only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Superuser")]
    [ProducesResponseType(typeof(ApiResponse<RoomDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> CreateRoom([FromBody] CreateRoomRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new CreateRoomCommand
            {
                Request = request,
                CreatedBy = GetCurrentUserId()
            };

            var roomDto = await _mediator.Send(command);
            return StatusCode(201, ApiResponse<RoomDto>.Ok(roomDto));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while creating room"));
        }
    }

    /// <summary>
    /// Update room (Admin+ only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Superuser")]
    [ProducesResponseType(typeof(ApiResponse<RoomDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateRoom(Guid id, [FromBody] UpdateRoomRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new UpdateRoomCommand
            {
                RoomId = id,
                Request = request
            };

            var roomDto = await _mediator.Send(command);
            return Ok(ApiResponse<RoomDto>.Ok(roomDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Room not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while updating room"));
        }
    }

    /// <summary>
    /// Soft delete room (Admin+ only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Superuser")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteRoom(Guid id)
    {
        try
        {
            var command = new DeleteRoomCommand { RoomId = id };
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { message = "Room deleted successfully" }));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Room not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while deleting room"));
        }
    }
}
