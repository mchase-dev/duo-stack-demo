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
/// Handler for RegisterCommand - creates a new user account
/// </summary>
public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterCommandResult>
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly PasswordService _passwordService;
    private readonly TokenHashService _tokenHashService;
    private readonly IMapper _mapper;

    public RegisterCommandHandler(
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

    public async Task<RegisterCommandResult> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // Check if email already exists
        var existingEmail = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower(), cancellationToken);
        if (existingEmail != null)
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Check if username already exists
        var existingUsername = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower(), cancellationToken);
        if (existingUsername != null)
        {
            throw new InvalidOperationException("Username already exists");
        }

        // Hash the password
        var passwordHash = _passwordService.HashPassword(request.Password);

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            EmailConfirmed = false,
            Username = request.Username,
            PasswordHash = passwordHash,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

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

        return new RegisterCommandResult
        {
            AuthResponse = new AuthResponse
            {
                User = userDto,
                AccessToken = accessToken
            },
            RefreshToken = refreshToken
        };
    }
}
