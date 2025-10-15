/**
 * AuthController Integration Tests
 */

using System.Net;
using System.Net.Http.Json;
using Xunit;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Requests;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Tests.Helpers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace DuoStackDemo.Tests.Controllers;

[Collection("Integration Tests")]
public class AuthControllerTests : IntegrationTestBase
{
    public AuthControllerTests(TestWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsCreated()
    {
        // Arrange - Verify database is clean
        using (var scope = Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var existingUsers = await db.Users.IgnoreQueryFilters().ToListAsync();
            Assert.Empty(existingUsers); // Ensure database is clean before test
        }

        var request = new RegisterRequest
        {
            Email = "newuser@example.com",
            Username = "newuser",
            Password = "password123"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert - if not Created, output the error for debugging
        if (response.StatusCode != HttpStatusCode.Created)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            throw new Exception($"Expected Created but got {response.StatusCode}. Response: {errorContent}");
        }
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<AuthResponse>>(TestHelpers.JsonOptions);
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.Equal("newuser@example.com", result.Data.User.Email);
        Assert.Equal("newuser", result.Data.User.Username);
        Assert.NotNull(result.Data.AccessToken);
    }

    [Fact]
    public async Task Register_WithInvalidEmail_ReturnsBadRequest()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "invalid-email",
            Username = "testuser",
            Password = "password123"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_ReturnsConflict()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "duplicate@example.com",
            Username = "user1",
            Password = "password123"
        };

        await Client.PostAsJsonAsync("/api/v1/auth/register", request);

        var duplicateRequest = new RegisterRequest
        {
            Email = "duplicate@example.com",
            Username = "user2",
            Password = "password123"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/register", duplicateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsOk()
    {
        // Arrange - Register a user first
        var registerResponse = await Client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest
        {
            Email = "login@example.com",
            Username = "loginuser",
            Password = "password123"
        });

        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        // Confirm email via database
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == "login@example.com");
        Assert.NotNull(user);
        user.EmailConfirmed = true;
        await db.SaveChangesAsync();

        // Act
        var loginRequest = new LoginRequest
        {
            Email = "login@example.com",
            Password = "password123"
        };

        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<TokenResponse>>(TestHelpers.JsonOptions);
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.NotNull(result.Data.AccessToken);
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "password123"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", request);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange - Register a user
        var registerResponse = await Client.PostAsJsonAsync("/api/v1/auth/register", new RegisterRequest
        {
            Email = "test@example.com",
            Username = "testuser",
            Password = "password123"
        });

        Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.NotNull(user);
        user.EmailConfirmed = true;
        await db.SaveChangesAsync();

        // Act
        var loginRequest = new LoginRequest
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        var response = await Client.PostAsJsonAsync("/api/v1/auth/login", loginRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_ReturnsOk()
    {
        // Act
        var response = await Client.PostAsync("/api/v1/auth/logout", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<object>>(TestHelpers.JsonOptions);
        Assert.NotNull(result);
        Assert.True(result.Success);
    }
}
