using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Events.Services;

namespace DuoStackDemo.Domain.Events.Queries;

/// <summary>
/// Handler for GetEventByIdQuery - retrieves a single event with permission check
/// </summary>
public class GetEventByIdQueryHandler : IRequestHandler<GetEventByIdQuery, EventDto>
{
    private readonly AppDbContext _context;
    private readonly EventVisibilityService _visibilityService;
    private readonly IMapper _mapper;

    public GetEventByIdQueryHandler(
        AppDbContext context,
        EventVisibilityService visibilityService,
        IMapper mapper)
    {
        _context = context;
        _visibilityService = visibilityService;
        _mapper = mapper;
    }

    public async Task<EventDto> Handle(GetEventByIdQuery query, CancellationToken cancellationToken)
    {
        // Find event by ID with creator
        var eventEntity = await _context.Events
            .Include(e => e.Creator)
            .FirstOrDefaultAsync(e => e.Id == query.EventId, cancellationToken);

        if (eventEntity == null)
        {
            throw new KeyNotFoundException("Event not found");
        }

        // Check visibility permissions
        if (!_visibilityService.CanViewEvent(eventEntity, query.UserId, query.UserRole))
        {
            throw new UnauthorizedAccessException("Insufficient permissions to view this event");
        }

        // Map to DTO using Mapster
        var eventDto = _mapper.Map<EventDto>(eventEntity);

        return eventDto;
    }
}
