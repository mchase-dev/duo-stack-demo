using MediatR;
using Microsoft.EntityFrameworkCore;
using MapsterMapper;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Services;
using DuoStackDemo.Domain.Auth.Services;

namespace DuoStackDemo.Domain.Auth.Commands;

/// <summary>
/// Handler for LoginCommand - authenticates user and generates tokens
/// </summary>
public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginCommandResult>
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly PasswordService _passwordService;
    private readonly TokenHashService _tokenHashService;
    private readonly IMapper _mapper;

    public LoginCommandHandler(
        AppDbContext context,
        JwtService jwtService,
        PasswordService passwordService,
        TokenHashService tokenHashService,
        IMapper mapper)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordService = passwordService;
        _tokenHashService = tokenHashService;
        _mapper = mapper;
    }

    public async Task<LoginCommandResult> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Verify password
        if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        // Generate tokens
        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Email, user.Username, user.Role.ToString());
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id, user.Email, user.Username, user.Role.ToString());

        // Hash and store refresh token
        var refreshTokenHash = _tokenHashService.HashToken(refreshToken);
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = refreshTokenHash,
            ExpiresAt = _jwtService.GetRefreshTokenExpiration(),
            Revoked = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.RefreshTokens.Add(refreshTokenEntity);
        await _context.SaveChangesAsync(cancellationToken);

        // Map user to DTO using Mapster
        var userDto = _mapper.Map<UserDto>(user);

        return new LoginCommandResult
        {
            TokenResponse = new TokenResponse
            {
                User = userDto,
                AccessToken = accessToken
            },
            RefreshToken = refreshToken
        };
    }
}
