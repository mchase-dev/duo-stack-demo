using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Commands;

/// <summary>
/// Handler for UpdatePageCommand - updates an existing CMS page
/// </summary>
public class UpdatePageCommandHandler : IRequestHandler<UpdatePageCommand, PageDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public UpdatePageCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PageDto> Handle(UpdatePageCommand command, CancellationToken cancellationToken)
    {
        var page = await _context.Pages.FindAsync(command.PageId, cancellationToken);

        if (page == null)
        {
            throw new KeyNotFoundException("Page not found");
        }

        var request = command.Request;

        // Update fields
        if (request.Title != null) page.Title = request.Title;
        if (request.Slug != null)
        {
            // Check if new slug conflicts with another page
            var existingPage = await _context.Pages
                .FirstOrDefaultAsync(p => p.Slug == request.Slug && p.Id != command.PageId && p.DeletedAt == null, cancellationToken);

            if (existingPage != null)
            {
                throw new InvalidOperationException("A page with this slug already exists");
            }

            page.Slug = request.Slug;
        }
        if (request.Content != null) page.Content = request.Content;
        if (request.IsPublished.HasValue) page.IsPublished = request.IsPublished.Value;

        page.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        // Load updated page with creator
        var updatedPage = await _context.Pages
            .Include(p => p.Creator)
            .FirstOrDefaultAsync(p => p.Id == command.PageId, cancellationToken);

        return _mapper.Map<PageDto>(updatedPage!);
    }
}
