using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Queries;

/// <summary>
/// Handler for GetAllPagesQuery - retrieves all CMS pages
/// </summary>
public class GetAllPagesQueryHandler : IRequestHandler<GetAllPagesQuery, List<PageDto>>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetAllPagesQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PageDto>> Handle(GetAllPagesQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = _context.Pages
            .Include(p => p.Creator)
            .Where(p => p.DeletedAt == null);

        if (!query.IncludeUnpublished)
        {
            dbQuery = dbQuery.Where(p => p.IsPublished);
        }

        var pages = await dbQuery
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);

        return pages.Select(p => _mapper.Map<PageDto>(p)).ToList();
    }
}
