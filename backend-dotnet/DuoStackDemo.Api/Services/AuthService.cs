using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Services;

namespace DuoStackDemo.Services;

/// <summary>
/// Service for handling user authentication and authorization
/// </summary>
public class AuthService
{
    private readonly AppDbContext _context;
    private readonly JwtService _jwtService;
    private readonly PasswordService _passwordService;

    /// <summary>
    /// Initializes a new instance of the AuthService
    /// </summary>
    public AuthService(
        AppDbContext context,
        JwtService jwtService,
        PasswordService passwordService)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordService = passwordService;
    }

    /// <summary>
    /// Registers a new user account
    /// </summary>
    /// <param name="request">Registration request containing user details</param>
    /// <returns>Authentication response with user data and access token</returns>
    /// <exception cref="InvalidOperationException">Thrown when email or username already exists</exception>
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if email already exists
        var existingEmail = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existingEmail != null)
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Check if username already exists
        var existingUsername = await _context.Users
            .FirstOrDefaultAsync(u => u.Username.ToLower() == request.Username.ToLower());
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
        var refreshTokenHash = HashToken(refreshToken);
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
        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            User = UserDto.FromUser(user),
            AccessToken = accessToken
        };
    }

    /// <summary>
    /// Authenticates a user and returns access token
    /// </summary>
    /// <param name="request">Login request containing credentials</param>
    /// <returns>Token response with access token</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when credentials are invalid</exception>
    public async Task<TokenResponse> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

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
        var refreshTokenHash = HashToken(refreshToken);
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
        await _context.SaveChangesAsync();

        return new TokenResponse
        {
            User = UserDto.FromUser(user),
            AccessToken = accessToken
        };
    }

    /// <summary>
    /// Refreshes an access token using a valid refresh token
    /// </summary>
    /// <param name="refreshToken">The refresh token to validate</param>
    /// <returns>Token response with new access token</returns>
    /// <exception cref="UnauthorizedAccessException">Thrown when refresh token is invalid or expired</exception>
    public async Task<TokenResponse> RefreshAccessTokenAsync(string refreshToken)
    {
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
        var refreshTokenHash = HashToken(refreshToken);

        // Find the refresh token in the database
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.UserId == userId && rt.TokenHash == refreshTokenHash);

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
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new UnauthorizedAccessException("User not found");
        }

        // Generate new access token
        var accessToken = _jwtService.GenerateAccessToken(user.Id, user.Email, user.Username, user.Role.ToString());

        return new TokenResponse
        {
            User = UserDto.FromUser(user),
            AccessToken = accessToken
        };
    }

    /// <summary>
    /// Logs out a user by revoking their refresh token
    /// </summary>
    /// <param name="refreshToken">The refresh token to revoke</param>
    /// <exception cref="InvalidOperationException">Thrown when refresh token is not found</exception>
    public async Task LogoutAsync(string refreshToken)
    {
        // Hash the refresh token to find it in the database
        var refreshTokenHash = HashToken(refreshToken);

        // Find the refresh token in the database
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash);

        if (storedToken == null)
        {
            throw new InvalidOperationException("Refresh token not found");
        }

        // Revoke the token
        storedToken.Revoked = true;
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Hashes a token using SHA256
    /// </summary>
    /// <param name="token">The token to hash</param>
    /// <returns>Hashed token as base64 string</returns>
    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
