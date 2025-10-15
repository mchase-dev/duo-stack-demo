using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Users.Commands;
using DuoStackDemo.Domain.Users.Queries;
using System.Security.Claims;

namespace DuoStackDemo.Controllers;

/// <summary>
/// Controller for user management operations
/// </summary>
[ApiController]
[Route("api/v1/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
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
    /// Get all users with pagination (Admin+ only)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Superuser")]
    [ProducesResponseType(typeof(ApiResponse<UsersListResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        try
        {
            var query = new GetAllUsersQuery
            {
                Page = page,
                PageSize = pageSize,
                Search = search
            };

            var response = await _mediator.Send(query);
            return Ok(ApiResponse<UsersListResponse>.Ok(response));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving users"));
        }
    }

    /// <summary>
    /// Get user by ID (self or Admin+)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetUserById(Guid id)
    {
        try
        {
            var query = new GetUserByIdQuery
            {
                UserId = id,
                CurrentUserId = GetCurrentUserId(),
                CurrentUserRole = GetCurrentUserRole()
            };

            var userDto = await _mediator.Send(query);
            return Ok(ApiResponse<UserDto>.Ok(userDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, ApiErrorResponse.CreateError("Insufficient permissions to view this user"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving user"));
        }
    }

    /// <summary>
    /// Update user (self or Admin+)
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateUser(Guid id, [FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new UpdateUserCommand
            {
                UserId = id,
                Request = request,
                CurrentUserId = GetCurrentUserId(),
                CurrentUserRole = GetCurrentUserRole()
            };

            var userDto = await _mediator.Send(command);
            return Ok(ApiResponse<UserDto>.Ok(userDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, ApiErrorResponse.CreateError("Insufficient permissions to update this user"));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while updating user"));
        }
    }

    /// <summary>
    /// Soft delete user (Admin+ only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Superuser")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        try
        {
            var command = new DeleteUserCommand { UserId = id };
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { message = "User deleted successfully" }));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while deleting user"));
        }
    }

    /// <summary>
    /// Update user role (Superuser only)
    /// </summary>
    [HttpPut("{id}/role")]
    [Authorize(Roles = "Superuser")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new UpdateUserRoleCommand
            {
                UserId = id,
                Request = request
            };

            var userDto = await _mediator.Send(command);
            return Ok(ApiResponse<UserDto>.Ok(userDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while updating user role"));
        }
    }
}
