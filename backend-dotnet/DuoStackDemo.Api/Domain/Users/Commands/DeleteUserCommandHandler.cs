using MediatR;
using DuoStackDemo.Data;

namespace DuoStackDemo.Domain.Users.Commands;

/// <summary>
/// Handler for DeleteUserCommand - soft deletes a user
/// </summary>
public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly AppDbContext _context;

    public DeleteUserCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteUserCommand command, CancellationToken cancellationToken)
    {
        // Find user by ID
        var user = await _context.Users.FindAsync(command.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Soft delete user by setting DeletedAt timestamp
        user.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
