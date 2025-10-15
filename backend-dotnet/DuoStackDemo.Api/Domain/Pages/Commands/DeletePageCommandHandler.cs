using MediatR;
using DuoStackDemo.Data;

namespace DuoStackDemo.Domain.Pages.Commands;

/// <summary>
/// Handler for DeletePageCommand - soft deletes a CMS page
/// </summary>
public class DeletePageCommandHandler : IRequestHandler<DeletePageCommand>
{
    private readonly AppDbContext _context;

    public DeletePageCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeletePageCommand command, CancellationToken cancellationToken)
    {
        var page = await _context.Pages.FindAsync(command.PageId, cancellationToken);

        if (page == null)
        {
            throw new KeyNotFoundException("Page not found");
        }

        page.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
