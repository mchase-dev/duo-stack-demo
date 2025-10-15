using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Messages.Commands;
using DuoStackDemo.Domain.Messages.Queries;

namespace DuoStackDemo.Controllers;

/// <summary>
/// Controller for direct messaging operations
/// </summary>
[ApiController]
[Route("api/v1/messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMediator _mediator;

    public MessagesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return Guid.Parse(userIdClaim!);
    }

    /// <summary>
    /// Get all conversations with last message and unread count
    /// </summary>
    [HttpGet("conversations")]
    [ProducesResponseType(typeof(ApiResponse<List<ConversationDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetConversations()
    {
        try
        {
            var query = new GetConversationsQuery { UserId = GetCurrentUserId() };
            var conversations = await _mediator.Send(query);
            return Ok(ApiResponse<List<ConversationDto>>.Ok(conversations));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving conversations"));
        }
    }

    /// <summary>
    /// Get messages with specific user
    /// </summary>
    [HttpGet("conversations/{userId}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetMessagesWithUser(Guid userId)
    {
        try
        {
            var query = new GetMessagesWithUserQuery
            {
                CurrentUserId = GetCurrentUserId(),
                OtherUserId = userId
            };

            var result = await _mediator.Send(query);
            return Ok(ApiResponse<object>.Ok(new
            {
                messages = result.Messages,
                user = result.User
            }));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("User not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while retrieving messages"));
        }
    }

    /// <summary>
    /// Send message to another user
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<MessageDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiErrorResponse.CreateError("Invalid input"));
        }

        try
        {
            var command = new SendMessageCommand
            {
                Request = request,
                FromUserId = GetCurrentUserId()
            };

            var messageDto = await _mediator.Send(command);
            return StatusCode(201, ApiResponse<MessageDto>.Ok(messageDto));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiErrorResponse.CreateError(ex.Message));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(ApiErrorResponse.CreateError("Recipient user not found"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiErrorResponse.CreateError("An error occurred while sending message"));
        }
    }
}
