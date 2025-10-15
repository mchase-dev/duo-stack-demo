using MediatR;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Rooms.Queries;

/// <summary>
/// Query to get all chat rooms
/// </summary>
public class GetAllRoomsQuery : IRequest<List<RoomDto>>
{
}
