using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Profile.Queries;
using DuoStackDemo.Domain.Profile.Commands;

namespace DuoStackDemo.Controllers;

/// <summary>
/// Controller for current user profile operations
/// </summary>
[ApiController]
[Route("api/v1/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProfileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetMyProfile()
    {
        try
        {
            var query = new GetMyProfileQuery { UserId = GetCurrentUserId() };
            var userDto = await _mediator.Send(query);
            return Ok(ApiResponse<UserDto>.Ok(userDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving profile"));
        }
    }

    /// <summary>
    /// Update current user profile
    /// </summary>
    [HttpPut("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new UpdateMyProfileCommand
            {
                UserId = GetCurrentUserId(),
                Request = request
            };

            var userDto = await _mediator.Send(command);
            return Ok(ApiResponse<UserDto>.Ok(userDto));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while updating profile"));
        }
    }

    /// <summary>
    /// Upload avatar for current user
    /// </summary>
    [HttpPost("me/avatar")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> UploadAvatar(IFormFile avatar)
    {
        try
        {
            if (avatar == null || avatar.Length == 0)
            {
                return BadRequest(ApiErrorResponse.CreateError("No file uploaded"));
            }

            var command = new UploadAvatarCommand
            {
                UserId = GetCurrentUserId(),
                Avatar = avatar
            };

            var avatarUrl = await _mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { avatarUrl }));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while uploading avatar"));
        }
    }

    /// <summary>
    /// Change password for current user
    /// </summary>
    [HttpPost("me/password")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new ChangePasswordCommand
            {
                UserId = GetCurrentUserId(),
                Request = request
            };

            await _mediator.Send(command);
            return Ok(ApiResponse<object>.Ok(new { message = "Password changed successfully" }));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(401, ApiErrorResponse.CreateError(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while changing password"));
        }
    }
}
