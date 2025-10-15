using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Messages.Commands;

/// <summary>
/// Command to send a message to another user
/// </summary>
public class SendMessageCommand : IRequest<MessageDto>
{
    /// <summary>
    /// Message request data
    /// </summary>
    public SendMessageRequest Request { get; set; } = null!;

    /// <summary>
    /// Sender's user ID (current user)
    /// </summary>
    public Guid FromUserId { get; set; }
}
