using MediatR;

namespace DuoStackDemo.Domain.Rooms.Commands;

/// <summary>
/// Command to soft delete a chat room (Admin+ only)
/// </summary>
public class DeleteRoomCommand : IRequest
{
    /// <summary>
    /// Room ID to delete
    /// </summary>
    public Guid RoomId { get; set; }
}
