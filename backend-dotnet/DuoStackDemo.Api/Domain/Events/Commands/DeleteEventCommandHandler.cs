using MediatR;
using DuoStackDemo.Data;
using DuoStackDemo.Domain.Events.Services;

namespace DuoStackDemo.Domain.Events.Commands;

/// <summary>
/// Handler for DeleteEventCommand - soft deletes a calendar event
/// </summary>
public class DeleteEventCommandHandler : IRequestHandler<DeleteEventCommand>
{
    private readonly AppDbContext _context;
    private readonly EventVisibilityService _visibilityService;

    public DeleteEventCommandHandler(
        AppDbContext context,
        EventVisibilityService visibilityService)
    {
        _context = context;
        _visibilityService = visibilityService;
    }

    public async Task Handle(DeleteEventCommand command, CancellationToken cancellationToken)
    {
        // Find event by ID
        var eventEntity = await _context.Events.FindAsync(command.EventId, cancellationToken);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException("Event not found");
        }

        // Check modify permissions
        if (!_visibilityService.CanModifyEvent(eventEntity, command.UserId, command.UserRole))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to delete this event");
        }

        // Soft delete event by setting DeletedAt timestamp
        eventEntity.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
