using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Messages.Queries;

/// <summary>
/// Handler for GetConversationsQuery - retrieves all conversations with last message and unread count
/// </summary>
public class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, List<ConversationDto>>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetConversationsQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ConversationDto>> Handle(GetConversationsQuery query, CancellationToken cancellationToken)
    {
        var userId = query.UserId;

        // Get all messages where user is sender or recipient
        var messages = await _context.Messages
            .Where(m => m.FromUserId == userId || m.ToUserId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        // Build conversations map with last message and unread count
        var conversationsMap = new Dictionary<Guid, (Data.Entities.Message LastMessage, int UnreadCount)>();

        foreach (var message in messages)
        {
            var otherUserId = message.FromUserId == userId ? message.ToUserId : message.FromUserId;

            if (!conversationsMap.ContainsKey(otherUserId))
            {
                // Count unread messages from this user
                var unreadCount = await _context.Messages
                    .Where(m => m.FromUserId == otherUserId && m.ToUserId == userId && !m.IsRead)
                    .CountAsync(cancellationToken);

                conversationsMap[otherUserId] = (message, unreadCount);
            }
        }

        // Get user details for all conversations
        var conversations = new List<ConversationDto>();
        foreach (var (otherUserId, (lastMessage, unreadCount)) in conversationsMap)
        {
            var user = await _context.Users.FindAsync(otherUserId, cancellationToken);

            if (user != null)
            {
                var userDto = _mapper.Map<UserDto>(user);
                var messageDto = _mapper.Map<MessageDto>(lastMessage);

                conversations.Add(new ConversationDto
                {
                    UserId = otherUserId,
                    User = userDto,
                    LastMessage = messageDto,
                    UnreadCount = unreadCount
                });
            }
        }

        // Sort by last message time
        conversations = conversations
            .OrderByDescending(c => c.LastMessage?.CreatedAt ?? DateTime.MinValue)
            .ToList();

        return conversations;
    }
}
