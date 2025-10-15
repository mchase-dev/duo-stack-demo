using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Rooms.Queries;

/// <summary>
/// Handler for GetAllRoomsQuery - retrieves all chat rooms
/// </summary>
public class GetAllRoomsQueryHandler : IRequestHandler<GetAllRoomsQuery, List<RoomDto>>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetAllRoomsQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<RoomDto>> Handle(GetAllRoomsQuery query, CancellationToken cancellationToken)
    {
        var rooms = await _context.Rooms
            .Include(r => r.Creator)
            .Where(r => r.DeletedAt == null)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        return rooms.Select(r => _mapper.Map<RoomDto>(r)).ToList();
    }
}
