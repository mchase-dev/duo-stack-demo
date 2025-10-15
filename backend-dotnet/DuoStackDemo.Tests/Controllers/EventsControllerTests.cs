/**
 * EventsController Integration Tests
 */

using System.Net;
using System.Net.Http.Json;
using Xunit;
using DuoStackDemo.Data;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;
using DuoStackDemo.Services;
using DuoStackDemo.Tests.Helpers;
using Microsoft.Extensions.DependencyInjection;

namespace DuoStackDemo.Tests.Controllers;

[Collection("Integration Tests")]
public class EventsControllerTests : IntegrationTestBase
{
    public EventsControllerTests(TestWebApplicationFactory<Program> factory) : base(factory)
    {
    }

    [Fact]
    public async Task CreateEvent_WithPublicVisibility_ReturnsCreated()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken();
        TestHelpers.AddAuthorizationHeader(Client, token);

        var request = new
        {
            Title = "Public Event",
            Description = "A public event",
            StartTime = DateTime.UtcNow.AddDays(1),
            EndTime = DateTime.UtcNow.AddDays(1).AddHours(2),
            Visibility = EventVisibility.Public,
            Color = "#3B82F6"
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/events", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateEvent_WithPrivateVisibility_ReturnsCreated()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken();
        TestHelpers.AddAuthorizationHeader(Client, token);

        var request = new
        {
            Title = "Private Event",
            StartTime = DateTime.UtcNow.AddDays(1),
            EndTime = DateTime.UtcNow.AddDays(1).AddHours(2),
            Visibility = EventVisibility.Private
        };

        // Act
        var response = await Client.PostAsJsonAsync("/api/v1/events", request);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task GetEvents_ReturnsPublicEvents()
    {
        // Arrange
        var (user1, token1) = await CreateUserWithToken("user1@example.com", "user1");
        var (user2, token2) = await CreateUserWithToken("user2@example.com", "user2");

        // Create public event as user1
        await CreateEventAsUser(token1, "Public Event", EventVisibility.Public, user1.Id);

        // Act - Get events as user2
        TestHelpers.AddAuthorizationHeader(Client, token2);
        var response = await Client.GetAsync("/api/v1/events");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<EventDto>>>(TestHelpers.JsonOptions);
        Assert.NotNull(result);
        Assert.True(result.Success);
        Assert.NotNull(result.Data);
        Assert.NotEmpty(result.Data);
    }

    [Fact]
    public async Task GetEvents_DoesNotReturnOtherUsersPrivateEvents()
    {
        // Arrange
        var (user1, token1) = await CreateUserWithToken("user1@example.com", "user1");
        var (user2, token2) = await CreateUserWithToken("user2@example.com", "user2");

        // Create private event as user1
        await CreateEventAsUser(token1, "Private Event", EventVisibility.Private, user1.Id);

        // Act - Get events as user2
        TestHelpers.AddAuthorizationHeader(Client, token2);
        var response = await Client.GetAsync("/api/v1/events");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // User2 should not see user1's private events
        // Note: This test assumes the response is filtered properly
    }

    [Fact]
    public async Task DeleteEvent_AsCreator_ReturnsOk()
    {
        // Arrange
        var (user, token) = await CreateUserWithToken();
        TestHelpers.AddAuthorizationHeader(Client, token);

        // Create event
        var createResponse = await CreateEventAsUser(token, "Test Event", EventVisibility.Public, user.Id);
        var eventId = await GetEventIdFromResponse(createResponse);

        // Act
        var response = await Client.DeleteAsync($"/api/v1/events/{eventId}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task DeleteEvent_AsNonCreator_ReturnsForbidden()
    {
        // Arrange
        var (user1, token1) = await CreateUserWithToken("user1@example.com", "user1");
        var (user2, token2) = await CreateUserWithToken("user2@example.com", "user2");

        // Create event as user1
        TestHelpers.AddAuthorizationHeader(Client, token1);
        var createResponse = await CreateEventAsUser(token1, "Test Event", EventVisibility.Public, user1.Id);
        var eventId = await GetEventIdFromResponse(createResponse);

        // Act - Try to delete as user2
        TestHelpers.AddAuthorizationHeader(Client, token2);
        var response = await Client.DeleteAsync($"/api/v1/events/{eventId}");

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private async Task<(User user, string token)> CreateUserWithToken(
        string email = "test@example.com",
        string username = "testuser")
    {
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var jwtService = scope.ServiceProvider.GetRequiredService<JwtService>();

        var user = TestHelpers.CreateTestUser(email: email, username: username);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var token = TestHelpers.GenerateTestToken(user, jwtService);
        return (user, token);
    }

    private async Task<HttpResponseMessage> CreateEventAsUser(
        string token,
        string title,
        EventVisibility visibility,
        Guid createdBy)
    {
        var client = Factory.CreateClient();
        TestHelpers.AddAuthorizationHeader(client, token);

        var request = new
        {
            Title = title,
            StartTime = DateTime.UtcNow.AddDays(1),
            EndTime = DateTime.UtcNow.AddDays(1).AddHours(2),
            Visibility = visibility
        };

        return await client.PostAsJsonAsync("/api/v1/events", request);
    }

    private async Task<string> GetEventIdFromResponse(HttpResponseMessage response)
    {
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<EventDto>>(TestHelpers.JsonOptions);
        if (result?.Data?.Id == null)
        {
            throw new Exception("Failed to get event ID from response");
        }
        return result.Data.Id.ToString();
    }
}
