using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Messages.Queries;

/// <summary>
/// Handler for GetMessagesWithUserQuery - retrieves all messages with a specific user and marks them as read
/// </summary>
public class GetMessagesWithUserQueryHandler : IRequestHandler<GetMessagesWithUserQuery, GetMessagesWithUserResult>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetMessagesWithUserQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<GetMessagesWithUserResult> Handle(GetMessagesWithUserQuery query, CancellationToken cancellationToken)
    {
        // Validate that the other user exists
        var otherUser = await _context.Users.FindAsync(query.OtherUserId, cancellationToken);

        if (otherUser == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Get all messages between the two users
        var messages = await _context.Messages
            .Where(m => (m.FromUserId == query.CurrentUserId && m.ToUserId == query.OtherUserId) ||
                       (m.FromUserId == query.OtherUserId && m.ToUserId == query.CurrentUserId))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        // Mark all messages from other user as read
        var unreadMessages = messages
            .Where(m => m.FromUserId == query.OtherUserId && m.ToUserId == query.CurrentUserId && !m.IsRead)
            .ToList();

        foreach (var message in unreadMessages)
        {
            message.IsRead = true;
        }

        if (unreadMessages.Any())
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Map to DTOs
        var messageDtos = messages.Select(m => _mapper.Map<MessageDto>(m)).ToList();
        var userDto = _mapper.Map<UserDto>(otherUser);

        return new GetMessagesWithUserResult
        {
            Messages = messageDtos,
            User = userDto
        };
    }
}
