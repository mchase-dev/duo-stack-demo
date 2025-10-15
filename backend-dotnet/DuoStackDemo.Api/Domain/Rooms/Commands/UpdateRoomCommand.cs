using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Rooms.Commands;

/// <summary>
/// Command to update a room
/// </summary>
public class UpdateRoomCommand : IRequest<RoomDto>
{
    public Guid RoomId { get; set; }
    public UpdateRoomRequest Request { get; set; } = null!;
}
