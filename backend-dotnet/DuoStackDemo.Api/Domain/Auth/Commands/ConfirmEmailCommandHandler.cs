using MediatR;
using DuoStackDemo.Data;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Handler for ConfirmEmailCommand - confirms a user's email address
/// </summary>
public class ConfirmEmailCommandHandler : IRequestHandler<ConfirmEmailCommand, ConfirmEmailResult>
{
    private readonly AppDbContext _context;

    public ConfirmEmailCommandHandler(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ConfirmEmailResult> Handle(ConfirmEmailCommand command, CancellationToken cancellationToken)
    {
        // Parse the token as user ID
        if (!Guid.TryParse(command.Token, out var userId))
        {
            throw new ArgumentException("Invalid confirmation token");
        }

        var user = await _context.Users.FindAsync(userId, cancellationToken);

        if (user == null)
        {
            throw new ArgumentException("Invalid or expired confirmation token");
        }

        if (user.EmailConfirmed)
        {
            return new ConfirmEmailResult
            {
                Message = "Email already confirmed"
            };
        }

        // Update user's email confirmation status
        user.EmailConfirmed = true;
        await _context.SaveChangesAsync(cancellationToken);

        return new ConfirmEmailResult
        {
            Message = "Email confirmed successfully"
        };
    }
}
