using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Domain.Events.Services;

namespace DuoStackDemo.Domain.Events.Queries;

/// <summary>
/// Handler for GetEventsQuery - retrieves events with visibility filtering
/// </summary>
public class GetEventsQueryHandler : IRequestHandler<GetEventsQuery, List<EventDto>>
{
    private readonly AppDbContext _context;
    private readonly EventVisibilityService _visibilityService;
    private readonly IMapper _mapper;

    public GetEventsQueryHandler(
        AppDbContext context,
        EventVisibilityService visibilityService,
        IMapper mapper)
    {
        _context = context;
        _visibilityService = visibilityService;
        _mapper = mapper;
    }

    public async Task<List<EventDto>> Handle(GetEventsQuery query, CancellationToken cancellationToken)
    {
        // Build query
        var dbQuery = _context.Events.Include(e => e.Creator).AsQueryable();

        // Filter by date range
        if (query.From.HasValue)
        {
            dbQuery = dbQuery.Where(e => e.StartTime >= query.From.Value);
        }
        if (query.To.HasValue)
        {
            dbQuery = dbQuery.Where(e => e.EndTime <= query.To.Value);
        }

        // Filter by visibility
        if (query.Visibility.HasValue)
        {
            dbQuery = dbQuery.Where(e => e.Visibility == query.Visibility.Value);
        }

        // Get all events matching basic filters
        var allEvents = await dbQuery.OrderBy(e => e.StartTime).ToListAsync(cancellationToken);

        // Filter events based on visibility permissions and map to DTOs
        var events = allEvents
            .Where(e => _visibilityService.CanViewEvent(e, query.UserId, query.UserRole))
            .Select(e => _mapper.Map<EventDto>(e))
            .ToList();

        return events;
    }
}
