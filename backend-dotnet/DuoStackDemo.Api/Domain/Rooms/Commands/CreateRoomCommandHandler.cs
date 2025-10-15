using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Rooms.Commands;

/// <summary>
/// Handler for CreateRoomCommand - creates a new chat room
/// </summary>
public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, RoomDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public CreateRoomCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<RoomDto> Handle(CreateRoomCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Generate slug from name
        var slug = request.Name.ToLower().Replace(" ", "-");

        // Check if slug already exists
        var existingRoom = await _context.Rooms
            .FirstOrDefaultAsync(r => r.Slug == slug && r.DeletedAt == null, cancellationToken);

        if (existingRoom != null)
        {
            throw new InvalidOperationException("A room with this name already exists");
        }

        // Create room
        var room = new Room
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Slug = slug,
            IsPublic = request.IsPublic,
            CreatedBy = command.CreatedBy,
            CreatedAt = DateTime.UtcNow
        };

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync(cancellationToken);

        // Load room with creator
        var createdRoom = await _context.Rooms
            .Include(r => r.Creator)
            .FirstOrDefaultAsync(r => r.Id == room.Id, cancellationToken);

        return _mapper.Map<RoomDto>(createdRoom!);
    }
}
