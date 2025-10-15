using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using System.Text.Json;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Events.Commands;

/// <summary>
/// Handler for CreateEventCommand - creates a new calendar event
/// </summary>
public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, EventDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public CreateEventCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<EventDto> Handle(CreateEventCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Validate date range
        if (request.EndTime <= request.StartTime)
        {
            throw new ArgumentException("End time must be after start time");
        }

        // Validate allowedUserIds if provided
        if (request.AllowedUserIds != null && request.AllowedUserIds.Any())
        {
            foreach (var allowedUserId in request.AllowedUserIds)
            {
                var user = await _context.Users.FindAsync(allowedUserId, cancellationToken);
                if (user == null)
                {
                    throw new ArgumentException($"User with ID {allowedUserId} not found");
                }
            }
        }

        // Create event
        var eventEntity = new Event
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            StartTime = DateTime.SpecifyKind(request.StartTime, DateTimeKind.Utc),
            EndTime = DateTime.SpecifyKind(request.EndTime, DateTimeKind.Utc),
            Visibility = request.Visibility,
            AllowedUserIds = request.AllowedUserIds != null && request.AllowedUserIds.Any()
                ? JsonSerializer.Serialize(request.AllowedUserIds)
                : null,
            CreatedBy = command.UserId,
            Color = request.Color,
            Location = request.Location,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Events.Add(eventEntity);
        await _context.SaveChangesAsync(cancellationToken);

        // Load the event with creator to map properly
        var createdEvent = await _context.Events
            .Include(e => e.Creator)
            .FirstOrDefaultAsync(e => e.Id == eventEntity.Id, cancellationToken);

        // Map to DTO using Mapster
        var eventDto = _mapper.Map<EventDto>(createdEvent!);

        return eventDto;
    }
}
