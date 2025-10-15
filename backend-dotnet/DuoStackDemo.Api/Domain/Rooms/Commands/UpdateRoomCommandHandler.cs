using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;
using System.Text.RegularExpressions;

namespace DuoStackDemo.Domain.Rooms.Commands;

/// <summary>
/// Handler for UpdateRoomCommand - updates an existing room
/// </summary>
public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, RoomDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public UpdateRoomCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<RoomDto> Handle(UpdateRoomCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Find room by ID
        var room = await _context.Rooms.FindAsync(command.RoomId, cancellationToken);

        if (room == null)
        {
            throw new KeyNotFoundException("Room not found");
        }

        // Update IsPublic if provided
        if (request.IsPublic.HasValue)
        {
            room.IsPublic = request.IsPublic.Value;
        }

        // If name is being updated, regenerate slug
        if (request.Name != null)
        {
            room.Name = request.Name;

            var baseSlug = GenerateSlug(request.Name);
            var slug = baseSlug;
            var counter = 1;

            // Ensure slug is unique (excluding current room)
            while (true)
            {
                var existing = await _context.Rooms
                    .FirstOrDefaultAsync(r => r.Slug == slug, cancellationToken);
                if (existing == null || existing.Id == command.RoomId)
                {
                    break;
                }
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            room.Slug = slug;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<RoomDto>(room);
    }

    private string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant().Trim();

        // Remove special characters
        slug = Regex.Replace(slug, @"[^\w\s-]", "");

        // Replace spaces with hyphens
        slug = Regex.Replace(slug, @"\s+", "-");

        // Replace multiple hyphens with single hyphen
        slug = Regex.Replace(slug, @"-+", "-");

        return slug;
    }
}
