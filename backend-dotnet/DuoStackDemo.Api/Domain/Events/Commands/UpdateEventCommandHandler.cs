using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using System.Text.Json;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Events.Services;

namespace DuoStackDemo.Domain.Events.Commands;

/// <summary>
/// Handler for UpdateEventCommand - updates an existing calendar event
/// </summary>
public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand, EventDto>
{
    private readonly AppDbContext _context;
    private readonly EventVisibilityService _visibilityService;
    private readonly IMapper _mapper;

    public UpdateEventCommandHandler(
        AppDbContext context,
        EventVisibilityService visibilityService,
        IMapper mapper)
    {
        _context = context;
        _visibilityService = visibilityService;
        _mapper = mapper;
    }

    public async Task<EventDto> Handle(UpdateEventCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Find event by ID
        var eventEntity = await _context.Events.FindAsync(command.EventId, cancellationToken);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException("Event not found");
        }

        // Check modify permissions
        if (!_visibilityService.CanModifyEvent(eventEntity, command.UserId, command.UserRole))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to update this event");
        }

        // Update fields
        if (request.Title != null) eventEntity.Title = request.Title;
        if (request.Description != null) eventEntity.Description = request.Description;
        if (request.StartTime.HasValue) eventEntity.StartTime = DateTime.SpecifyKind(request.StartTime.Value, DateTimeKind.Utc);
        if (request.EndTime.HasValue) eventEntity.EndTime = DateTime.SpecifyKind(request.EndTime.Value, DateTimeKind.Utc);
        if (request.Visibility.HasValue) eventEntity.Visibility = request.Visibility.Value;
        if (request.Color != null) eventEntity.Color = request.Color;
        if (request.Location != null) eventEntity.Location = request.Location;

        if (request.AllowedUserIds != null)
        {
            // Validate allowedUserIds
            if (request.AllowedUserIds.Any())
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

            eventEntity.AllowedUserIds = request.AllowedUserIds.Any()
                ? JsonSerializer.Serialize(request.AllowedUserIds)
                : null;
        }

        // Validate date range if both are provided
        if (eventEntity.EndTime <= eventEntity.StartTime)
        {
            throw new ArgumentException("End time must be after start time");
        }

        eventEntity.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Return updated event with creator
        var updatedEvent = await _context.Events
            .Include(e => e.Creator)
            .FirstOrDefaultAsync(e => e.Id == command.EventId, cancellationToken);

        // Map to DTO using Mapster
        var eventDto = _mapper.Map<EventDto>(updatedEvent!);

        return eventDto;
    }
}
