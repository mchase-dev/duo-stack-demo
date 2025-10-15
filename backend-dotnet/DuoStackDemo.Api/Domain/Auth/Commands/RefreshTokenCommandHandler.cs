using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Services;
using DuoStackDemo.Domain.Auth.Services;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Handler for RefreshTokenCommand - validates refresh token and generates new access token
/// </summary>
public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, TokenResponse>
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly TokenHashService _tokenHashService;
    private readonly IMapper _mapper;

    public RefreshTokenCommandHandler(
        AppDbContext context,
        JwtService jwtService,
        TokenHashService tokenHashService,
        IMapper mapper)
    {
        _context = context;
        _jwtService = jwtService;
        _tokenHashService = tokenHashService;
        _mapper = mapper;
    }

    public async Task<TokenResponse> Handle(RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        var refreshToken = command.RefreshToken;

        // Validate the refresh token
        var principal = _jwtService.ValidateToken(refreshToken);
        if (principal == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        var userId = _jwtService.GetUserIdFromClaims(principal);
        if (userId == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        // Hash the refresh token to compare with stored hash
        var refreshTokenHash = _tokenHashService.HashToken(refreshToken);

        // Find the refresh token in the database
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.TokenHash == refreshTokenHash, cancellationToken);

        if (storedToken == null)
        {
            throw new UnauthorizedAccessException("Invalid refresh token");
        }

        // Check if token is revoked
        if (storedToken.Revoked)
        {
            throw new UnauthorizedAccessException("Refresh token has been revoked");
        }

        // Check if token is expired
        if (storedToken.ExpiresAt < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Refresh token has expired");
        }

        // Get user details
        var user = await _context.Users.FindAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found");
        }

        // Generate new access token
        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Email, user.Username, user.Role.ToString());

        // Map user to DTO using Mapster
        var userDto = _mapper.Map<UserDto>(user);

        return new TokenResponse
        {
            User = userDto,
            AccessToken = accessToken
        };
    }
}
