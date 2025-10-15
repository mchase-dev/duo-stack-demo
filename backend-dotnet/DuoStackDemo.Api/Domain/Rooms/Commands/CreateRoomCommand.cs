using MediatR;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Rooms.Commands;

/// <summary>
/// Command to create a new chat room (Admin+ only)
/// </summary>
public class CreateRoomCommand : IRequest<RoomDto>
{
    /// <summary>
    /// Room creation request data
    /// </summary>
    public CreateRoomRequest Request { get; set; } = null!;

    /// <summary>
    /// Current user ID (room creator)
    /// </summary>
    public Guid CreatedBy { get; set; }
}
