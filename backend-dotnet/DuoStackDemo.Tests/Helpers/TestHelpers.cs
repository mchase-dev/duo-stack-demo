/**
 * Test Helpers
 * Utility functions for creating test data
 */

using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.Services;
using DuoStackDemo.DTOs.Responses;

namespace DuoStackDemo.Tests.Helpers;

public static class TestHelpers
{
    /// <summary>
    /// JSON serialization options that match the API configuration
    /// </summary>
    public static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };
    public static User CreateTestUser(
        string email = "test@example.com",
        string username = "testuser",
        string password = "password123",
        UserRole role = UserRole.User,
        bool emailConfirmed = true)
    {
        var passwordService = new PasswordService();
        return new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Username = username,
            PasswordHash = passwordService.HashPassword(password),
            Role = role,
            EmailConfirmed = emailConfirmed,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static User CreateAdminUser()
    {
        return CreateTestUser(
            email: "admin@example.com",
            username: "admin",
            role: UserRole.Admin);
    }

    public static User CreateSuperuser()
    {
        return CreateTestUser(
            email: "superuser@example.com",
            username: "superuser",
            role: UserRole.Superuser);
    }

    public static string GenerateTestToken(User user, JwtService jwtService)
    {
        return jwtService.GenerateAccessToken(user.Id, user.Email, user.Username, user.Role.ToString());
    }

    public static void AddAuthorizationHeader(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}
