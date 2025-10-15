using MediatR;
using DuoStackDemo.Data;

namespace DuoStackDemo.Domain.Rooms.Commands;

/// <summary>
/// Handler for DeleteRoomCommand - soft deletes a chat room
/// </summary>
public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand>
{
    private readonly AppDbContext _context;

    public DeleteRoomCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteRoomCommand command, CancellationToken cancellationToken)
    {
        var room = await _context.Rooms.FindAsync(command.RoomId, cancellationToken);

        if (room == null)
        {
            throw new KeyNotFoundException("Room not found");
        }

        room.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
