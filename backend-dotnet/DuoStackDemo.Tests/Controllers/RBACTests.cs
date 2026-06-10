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
        var ct = TestContext.Current.CancellationToken;
        var (user, token) = await CreateUserWithToken(UserRole.Admin, ct);
        TestHelpers.AddAuthorizationHeader(Client, token);

        var response = await Client.GetAsync("/api/v1/rooms", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithSuperuser_ReturnsOk()
    {
        var ct = TestContext.Current.CancellationToken;
        var (user, token) = await CreateUserWithToken(UserRole.Superuser, ct);
        TestHelpers.AddAuthorizationHeader(Client, token);

        var response = await Client.GetAsync("/api/v1/rooms", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task AdminEndpoint_WithRegularUser_ReturnsForbidden()
    {
        var ct = TestContext.Current.CancellationToken;
        var (user, token) = await CreateUserWithToken(UserRole.User, ct);
        TestHelpers.AddAuthorizationHeader(Client, token);

        var response = await Client.PostAsJsonAsync("/api/v1/rooms", new
        {
            name = "Test Room",
            description = "Test",
            isPublic = true
        }, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task SuperuserEndpoint_WithSuperuser_ReturnsOk()
    {
        var ct = TestContext.Current.CancellationToken;
        var (user, token) = await CreateUserWithToken(UserRole.Superuser, ct);
        TestHelpers.AddAuthorizationHeader(Client, token);

        var response = await Client.PostAsJsonAsync("/api/v1/pages", new
        {
            Title = "Test Page",
            Slug = "test-page",
            Content = "Test content",
            IsPublished = false
        }, ct);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task SuperuserEndpoint_WithAdmin_ReturnsForbidden()
    {
        var ct = TestContext.Current.CancellationToken;
        var (user, token) = await CreateUserWithToken(UserRole.Admin, ct);
        TestHelpers.AddAuthorizationHeader(Client, token);

        var response = await Client.PostAsJsonAsync("/api/v1/pages", new
        {
            Title = "Test Page",
            Slug = "test-page-admin",
            Content = "Test content",
            IsPublished = false
        }, ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutAuth_ReturnsUnauthorized()
    {
        var ct = TestContext.Current.CancellationToken;

        var response = await Client.GetAsync("/api/v1/profile/me", ct);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithValidAuth_ReturnsOk()
    {
        var ct = TestContext.Current.CancellationToken;
        var (user, token) = await CreateUserWithToken(UserRole.User, ct);
        TestHelpers.AddAuthorizationHeader(Client, token);

        var response = await Client.GetAsync("/api/v1/profile/me", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task<(User user, string token)> CreateUserWithToken(UserRole role, CancellationToken ct = default)
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
        await db.SaveChangesAsync(ct);

        var token = TestHelpers.GenerateTestToken(user, jwtService);

        return (user, token);
    }
}
