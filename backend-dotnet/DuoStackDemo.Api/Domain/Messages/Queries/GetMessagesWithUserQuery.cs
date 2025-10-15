using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Messages.Queries;

/// <summary>
/// Query to get all messages with a specific user
/// </summary>
public class GetMessagesWithUserQuery : IRequest<GetMessagesWithUserResult>
{
    /// <summary>
    /// Current user ID
    /// </summary>
    public Guid CurrentUserId { get; set; }

    /// <summary>
    /// Other user ID to get conversation with
    /// </summary>
    public Guid OtherUserId { get; set; }
}

/// <summary>
/// Result containing messages and other user information
/// </summary>
public class GetMessagesWithUserResult
{
    /// <summary>
    /// List of messages in the conversation
    /// </summary>
    public List<MessageDto> Messages { get; set; } = new();

    /// <summary>
    /// Information about the other user
    /// </summary>
    public UserDto User { get; set; } = null!;
}
