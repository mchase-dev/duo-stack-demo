using MediatR;
using Microsoft.EntityFrameworkCore;
using DuoStackDemo.Data;
using DuoStackDemo.Services;

namespace DuoStackDemo.Domain.Profile.Commands;

/// <summary>
/// Handler for ChangePasswordCommand - changes current user's password
/// </summary>
public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, Unit>
{
    private readonly AppDbContext _context;
    private readonly PasswordService _passwordService;

    public ChangePasswordCommandHandler(
        AppDbContext context,
        PasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task<Unit> Handle(ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(command.UserId, cancellationToken);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        // Verify current password
        if (!_passwordService.VerifyPassword(command.Request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Validate new password strength
        var (isValid, errors) = _passwordService.ValidatePasswordStrength(command.Request.NewPassword);
        if (!isValid)
        {
            throw new ArgumentException(string.Join(", ", errors));
        }

        // Hash and save new password
        user.PasswordHash = _passwordService.HashPassword(command.Request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
