using MediatR;
using MapsterMapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Hubs;

namespace DuoStackDemo.Domain.Messages.Commands;

/// <summary>
/// Handler for SendMessageCommand - sends a direct message to another user
/// </summary>
public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, MessageDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;
    private readonly IHubContext<RoomsHub> _hubContext;

    public SendMessageCommandHandler(
        AppDbContext context,
        IMapper mapper,
        IHubContext<RoomsHub> hubContext)
    {
        _context = context;
        _mapper = mapper;
        _hubContext = hubContext;
    }

    public async Task<MessageDto> Handle(SendMessageCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Validate that sender and recipient are different
        if (command.FromUserId == request.ToUserId)
        {
            throw new ArgumentException("Cannot send message to yourself");
        }

        // Validate that recipient exists
        var recipient = await _context.Users.FindAsync(request.ToUserId, cancellationToken);

        if (recipient == null)
        {
            throw new KeyNotFoundException("Recipient user not found");
        }

        // Create message
        var message = new Message
        {
            Id = Guid.NewGuid(),
            FromUserId = command.FromUserId,
            ToUserId = request.ToUserId,
            Content = request.Content,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var messageDto = _mapper.Map<MessageDto>(message);

        // Get sender information for real-time event
        var sender = await _context.Users.FindAsync(command.FromUserId, cancellationToken);
        var senderUsername = sender?.Username ?? sender?.Email ?? "Unknown";

        // Emit real-time event to both sender and recipient
        var messageEvent = new
        {
            messageId = message.Id.ToString(),
            senderId = message.FromUserId.ToString(),
            senderUsername = senderUsername,
            receiverId = message.ToUserId.ToString(),
            message = message.Content,
            timestamp = message.CreatedAt.ToString("o")
        };

        // Send to recipient
        await _hubContext.Clients.Group($"user:{message.ToUserId}").SendAsync("UserMessage", messageEvent, cancellationToken);
        // Send to sender so their UI updates
        await _hubContext.Clients.Group($"user:{message.FromUserId}").SendAsync("UserMessage", messageEvent, cancellationToken);

        return messageDto;
    }
}
