using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Domain.Pages.Commands;

/// <summary>
/// Handler for CreatePageCommand - creates a new CMS page
/// </summary>
public class CreatePageCommandHandler : IRequestHandler<CreatePageCommand, PageDto>
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public CreatePageCommandHandler(
        AppDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PageDto> Handle(CreatePageCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Auto-generate slug from title if not provided
        var slug = !string.IsNullOrWhiteSpace(request.Slug)
            ? GenerateSlug(request.Slug)
            : GenerateSlug(request.Title);

        // Ensure slug is unique
        slug = await EnsureUniqueSlug(slug, cancellationToken);

        // Create page
        var page = new Page
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Slug = slug,
            Content = request.Content,
            IsPublished = request.IsPublished ?? false,
            CreatedBy = command.CreatedBy,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Pages.Add(page);
        await _context.SaveChangesAsync(cancellationToken);

        // Load page with creator
        var createdPage = await _context.Pages
            .Include(p => p.Creator)
            .FirstOrDefaultAsync(p => p.Id == page.Id, cancellationToken);

        return _mapper.Map<PageDto>(createdPage!);
    }

    /// <summary>
    /// Generate a URL-friendly slug from text
    /// </summary>
    private static string GenerateSlug(string text)
    {
        // Convert to lowercase and replace spaces with hyphens
        var slug = text.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("_", "-");

        // Remove invalid characters
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Remove consecutive hyphens
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-");

        // Trim hyphens from start and end
        slug = slug.Trim('-');

        // Limit length
        if (slug.Length > 200)
        {
            slug = slug.Substring(0, 200).TrimEnd('-');
        }

        return slug;
    }

    /// <summary>
    /// Ensure slug is unique by adding a number suffix if needed
    /// </summary>
    private async Task<string> EnsureUniqueSlug(string baseSlug, CancellationToken cancellationToken)
    {
        var slug = baseSlug;
        var counter = 1;

        while (await _context.Pages.AnyAsync(p => p.Slug == slug && p.DeletedAt == null, cancellationToken))
        {
            slug = $"{baseSlug}-{counter}";
            counter++;
        }

        return slug;
    }
}
