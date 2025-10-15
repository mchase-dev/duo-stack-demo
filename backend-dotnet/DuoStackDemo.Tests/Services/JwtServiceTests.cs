/**
 * JWT Service Tests
 */

using Xunit;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.Services;
using Microsoft.Extensions.Configuration;

namespace DuoStackDemo.Tests.Services;

public class JwtServiceTests
{
    private readonly JwtService _jwtService;

    public JwtServiceTests()
    {
        // Create test configuration
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "Jwt:Secret", "test-secret-key-for-testing-purposes-at-least-32-chars-long" },
                { "Jwt:Issuer", "test-issuer" },
                { "Jwt:Audience", "test-audience" },
                { "Jwt:ExpiresInMinutes", "15" },
                { "Jwt:RefreshTokenExpiresInDays", "7" }
            })
            .Build();

        _jwtService = new JwtService(configuration);
    }

    [Fact]
    public void GenerateAccessToken_ShouldCreateValidToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var username = "testuser";
        var role = "User";

        // Act
        var token = _jwtService.GenerateAccessToken(userId, email, username, role);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        var parts = token.Split('.');
        Assert.Equal(3, parts.Length); // JWT format: header.payload.signature
    }

    [Fact]
    public void ValidateToken_ShouldReturnPrincipalForValidToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var username = "testuser";
        var role = "User";
        var token = _jwtService.GenerateAccessToken(userId, email, username, role);

        // Act
        var principal = _jwtService.ValidateToken(token);

        // Assert
        Assert.NotNull(principal);
    }

    [Fact]
    public void ValidateToken_ShouldExtractClaims()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var username = "testuser";
        var role = "Admin";
        var token = _jwtService.GenerateAccessToken(userId, email, username, role);

        // Act
        var principal = _jwtService.ValidateToken(token);

        // Assert
        Assert.NotNull(principal);
        Assert.Equal(userId.ToString(), principal!.FindFirst("userId")?.Value);
        Assert.Equal(email, principal.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value);
        Assert.Equal(role, principal.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value);
    }

    [Fact]
    public void ValidateToken_ShouldReturnNullForInvalidToken()
    {
        // Act
        var principal = _jwtService.ValidateToken("invalid-token");

        // Assert
        Assert.Null(principal);
    }

    [Fact]
    public void ValidateToken_ShouldReturnNullForMalformedToken()
    {
        // Act
        var principal = _jwtService.ValidateToken("not.a.jwt");

        // Assert
        Assert.Null(principal);
    }

    [Fact]
    public void GenerateRefreshToken_ShouldCreateToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var username = "testuser";
        var role = "User";

        // Act
        var token = _jwtService.GenerateRefreshToken(userId, email, username, role);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        var parts = token.Split('.');
        Assert.Equal(3, parts.Length);
    }

    [Fact]
    public void ValidateRefreshToken_ShouldReturnPrincipalForValidToken()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var email = "test@example.com";
        var username = "testuser";
        var role = "User";
        var token = _jwtService.GenerateRefreshToken(userId, email, username, role);

        // Act
        var principal = _jwtService.ValidateToken(token);

        // Assert
        Assert.NotNull(principal);
        Assert.Equal(userId.ToString(), principal!.FindFirst("userId")?.Value);
    }
}
