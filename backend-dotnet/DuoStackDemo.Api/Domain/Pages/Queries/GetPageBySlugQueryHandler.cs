using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Queries;

/// <summary>
/// Handler for GetPageBySlugQuery - retrieves page by slug
/// </summary>
public class GetPageBySlugQueryHandler : IRequestHandler<GetPageBySlugQuery, PageDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public GetPageBySlugQueryHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PageDto> Handle(GetPageBySlugQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = _context.Pages
            .Include(p => p.Creator)
            .Where(p => p.Slug == query.Slug && p.DeletedAt == null);

        if (!query.IncludeUnpublished)
        {
            dbQuery = dbQuery.Where(p => p.IsPublished);
        }

        var page = await dbQuery.FirstOrDefaultAsync(cancellationToken);

        if (page == null)
        {
            throw new KeyNotFoundException("Page not found");
        }

        return _mapper.Map<PageDto>(page);
    }
}
