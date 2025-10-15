using Microsoft.AspNetCore.SignalR;
using DuoStackDemo.Hubs;
using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.Services;

/// <summary>
/// Service for emitting real-time events through SignalR
/// Used by controllers to broadcast events to connected clients
/// </summary>
public class RealtimeService
{
    private readonly IHubContext<RoomsHub> _hubContext;

    public RealtimeService(IHubContext<RoomsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    /// <summary>
    /// Emit user message event (direct message)
    /// </summary>
    public async Task EmitUserMessageAsync(Guid toUserId, object data)
    {
        await _hubContext.Clients.Group($"user:{toUserId}").SendAsync("UserMessage", data);
    }

    /// <summary>
    /// Emit room message event
    /// </summary>
    public async Task EmitRoomMessageAsync(Guid roomId, object data)
    {
        await _hubContext.Clients.Group($"room:{roomId}").SendAsync("RoomMessage", data);
    }

    /// <summary>
    /// Emit event created notification
    /// - Public events: broadcast to all connected users
    /// - Restricted events: emit to owner + allowed users + admins
    /// - Private events: emit to owner only
    /// </summary>
    public async Task EmitEventCreatedAsync(Event eventData, Guid createdBy)
    {
        if (eventData.Visibility == EventVisibility.Public)
        {
            // Broadcast to all connected users
            await _hubContext.Clients.All.SendAsync("EventCreated", eventData);
        }
        else if (eventData.Visibility == EventVisibility.Restricted)
        {
            // Emit to owner
            await _hubContext.Clients.Group($"user:{createdBy}").SendAsync("EventCreated", eventData);

            // Emit to allowed users
            if (!string.IsNullOrEmpty(eventData.AllowedUserIds))
            {
                try
                {
                    var allowedUserIds = System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(eventData.AllowedUserIds);
                    if (allowedUserIds != null)
                    {
                        foreach (var userId in allowedUserIds)
                        {
                            await _hubContext.Clients.Group($"user:{userId}").SendAsync("EventCreated", eventData);
                        }
                    }
                }
                catch
                {
                    // Invalid JSON, skip
                }
            }
        }
        else // Private
        {
            // Emit to owner only
            await _hubContext.Clients.Group($"user:{createdBy}").SendAsync("EventCreated", eventData);
        }
    }

    /// <summary>
    /// Emit event updated notification
    /// </summary>
    public async Task EmitEventUpdatedAsync(Event eventData, Guid createdBy)
    {
        if (eventData.Visibility == EventVisibility.Public)
        {
            await _hubContext.Clients.All.SendAsync("EventUpdated", eventData);
        }
        else if (eventData.Visibility == EventVisibility.Restricted)
        {
            await _hubContext.Clients.Group($"user:{createdBy}").SendAsync("EventUpdated", eventData);

            if (!string.IsNullOrEmpty(eventData.AllowedUserIds))
            {
                try
                {
                    var allowedUserIds = System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(eventData.AllowedUserIds);
                    if (allowedUserIds != null)
                    {
                        foreach (var userId in allowedUserIds)
                        {
                            await _hubContext.Clients.Group($"user:{userId}").SendAsync("EventUpdated", eventData);
                        }
                    }
                }
                catch
                {
                    // Invalid JSON, skip
                }
            }
        }
        else // Private
        {
            await _hubContext.Clients.Group($"user:{createdBy}").SendAsync("EventUpdated", eventData);
        }
    }

    /// <summary>
    /// Emit event deleted notification
    /// </summary>
    public async Task EmitEventDeletedAsync(Guid eventId, Event eventData, Guid createdBy)
    {
        var data = new { id = eventId };

        if (eventData.Visibility == EventVisibility.Public)
        {
            await _hubContext.Clients.All.SendAsync("EventDeleted", data);
        }
        else if (eventData.Visibility == EventVisibility.Restricted)
        {
            await _hubContext.Clients.Group($"user:{createdBy}").SendAsync("EventDeleted", data);

            if (!string.IsNullOrEmpty(eventData.AllowedUserIds))
            {
                try
                {
                    var allowedUserIds = System.Text.Json.JsonSerializer.Deserialize<List<Guid>>(eventData.AllowedUserIds);
                    if (allowedUserIds != null)
                    {
                        foreach (var userId in allowedUserIds)
                        {
                            await _hubContext.Clients.Group($"user:{userId}").SendAsync("EventDeleted", data);
                        }
                    }
                }
                catch
                {
                    // Invalid JSON, skip
                }
            }
        }
        else // Private
        {
            await _hubContext.Clients.Group($"user:{createdBy}").SendAsync("EventDeleted", data);
        }
    }
}
