using MediatR;
using Microsoft.EntityFrameworkCore;
using DuoStackDemo.Data;
using DuoStackDemo.Domain.Auth.Services;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Handler for LogoutCommand - revokes a refresh token
/// </summary>
public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly AppDbContext _context;
    private readonly TokenHashService _tokenHashService;

    public LogoutCommandHandler(
        AppDbContext context,
        TokenHashService tokenHashService)
    {
        _context = context;
        _tokenHashService = tokenHashService;
    }

    public async Task Handle(LogoutCommand command, CancellationToken cancellationToken)
    {
        var refreshToken = command.RefreshToken;

        // Hash the refresh token to find it in the database
        var refreshTokenHash = _tokenHashService.HashToken(refreshToken);

        // Find the refresh token in the database
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash, cancellationToken);

        if (storedToken == null)
        {
            throw new InvalidOperationException("Refresh token not found");
        }

        // Revoke the token
        storedToken.Revoked = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
