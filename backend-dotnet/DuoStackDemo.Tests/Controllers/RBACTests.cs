/**
 * RBAC Authorization Tests
 */

using System.Net;
using System.Net.Http.Json;
using Xunit;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.Services;
using DuoStackDemo.Tests.Helpers;
using Microsoft.Extensions.DependencyInjection;

namespace DuoStackDemo.Tests.Controllers;

[Collection("Integration Tests")]
public class RBACTests : IntegrationTestBase
{
    public RBACTests(TestWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task AdminEndpoint_WithAdminUser_ReturnsOk()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken(UserRole.Admin);

        TestHelpers.AddAuthorizationHeader(Client, token);

        // Act
        var response = await Client.GetAsync("/api/v1/rooms");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithSuperuser_ReturnsOk()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken(UserRole.Superuser);

        TestHelpers.AddAuthorizationHeader(Client, token);

        // Act
        var response = await Client.GetAsync("/api/v1/rooms");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithRegularUser_ReturnsForbidden()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken(UserRole.User);

        TestHelpers.AddAuthorizationHeader(Client, token);

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/rooms", new
        {
            name = "Test Room",
            description = "Test",
            isPublic = true
        });

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SuperuserEndpoint_WithSuperuser_ReturnsOk()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken(UserRole.Superuser);

        TestHelpers.AddAuthorizationHeader(Client, token);

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/pages", new
        {
            Title = "Test Page",
            Slug = "test-page",
            Content = "Test content",
            IsPublished = false
        });

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task SuperuserEndpoint_WithAdmin_ReturnsForbidden()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken(UserRole.Admin);

        TestHelpers.AddAuthorizationHeader(Client, token);

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/pages", new
        {
            Title = "Test Page",
            Slug = "test-page-admin",
            Content = "Test content",
            IsPublished = false
        });

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutAuth_ReturnsUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("/api/v1/profile/me");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithValidAuth_ReturnsOk()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken(UserRole.User);

        TestHelpers.AddAuthorizationHeader(Client, token);

        // Act
        var response = await Client.GetAsync("/api/v1/profile/me");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task<(User user, string token)> CreateUserWithToken(UserRole role)
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var jwtService = scope.ServiceProvider.GetRequiredService<JwtService>();

        var user = TestHelpers.CreateTestUser(
            email: $"{role.ToString().ToLower()}@example.com",
            username: role.ToString().ToLower(),
            role: role
        );

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = TestHelpers.GenerateTestToken(user, jwtService);

        return (user, token);
    }
}
