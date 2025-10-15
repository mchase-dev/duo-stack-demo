using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Messages.Queries;

/// <summary>
/// Query to get all conversations for the current user
/// </summary>
public class GetConversationsQuery : IRequest<List<ConversationDto>>
{
    /// <summary>
    /// Current user ID
    /// </summary>
    public Guid UserId { get; set; }
}
