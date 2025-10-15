using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DuoStackDemo.Hubs;

/// <summary>
/// SignalR Hub for real-time chat rooms and messaging
/// </summary>
[Authorize]
public class RoomsHub : Hub
{
    private readonly ILogger<RoomsHub> _logger;
    private static readonly Dictionary<string, HashSet<(string UserId, string Username, string ConnectionId)>> _roomMembers = new();
    private static readonly Dictionary<string, HashSet<string>> _onlineUsers = new(); // userId -> Set of connectionIds
    private static readonly object _lock = new object();

    public RoomsHub(ILogger<RoomsHub> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Called when client connects
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var userId = GetUserId();
        var userEmail = GetUserEmail();

        _logger.LogInformation("✅ User connected: {Email} ({ConnectionId})", userEmail, Context.ConnectionId);

        // Join user to their personal room (for direct messages)
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user:{userId}");

        // Track user as online
        bool wasOffline;
        lock (_lock)
        {
            if (!_onlineUsers.ContainsKey(userId))
            {
                _onlineUsers[userId] = new HashSet<string>();
                wasOffline = true;
            }
            else
            {
                wasOffline = false;
            }
            _onlineUsers[userId].Add(Context.ConnectionId);
        }

        // If user just came online, broadcast to all connected clients
        if (wasOffline)
        {
            await Clients.All.SendAsync("UserOnline", new { userId });
        }

        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called when client disconnects
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userEmail = GetUserEmail();
        var userId = GetUserId();
        var username = GetUsername();

        if (exception != null)
        {
            _logger.LogError(exception, "🔴 User disconnected with error: {Email} ({ConnectionId})", userEmail, Context.ConnectionId);
        }
        else
        {
            _logger.LogInformation("❌ User disconnected: {Email} ({ConnectionId})", userEmail, Context.ConnectionId);
        }

        // Remove connection from online users tracking
        bool isNowOffline = false;
        lock (_lock)
        {
            if (_onlineUsers.ContainsKey(userId))
            {
                _onlineUsers[userId].Remove(Context.ConnectionId);

                // If user has no more active connections, mark as offline
                if (_onlineUsers[userId].Count == 0)
                {
                    _onlineUsers.Remove(userId);
                    isNowOffline = true;
                }
            }

            // Remove user from all rooms they were in
            foreach (var (roomId, members) in _roomMembers.ToList())
            {
                var member = members.FirstOrDefault(m => m.ConnectionId == Context.ConnectionId);
                if (member != default)
                {
                    members.Remove(member);
                    _logger.LogInformation("👋 User {Username} removed from room {RoomId} due to disconnect", username, roomId);

                    // Notify other room members
                    _ = Clients.Group($"room:{roomId}").SendAsync("UserLeftRoom", new
                    {
                        roomId,
                        userId,
                        username
                    });

                    if (members.Count == 0)
                    {
                        _roomMembers.Remove(roomId);
                    }
                }
            }
        }

        // Broadcast user offline to all connected clients
        if (isNowOffline)
        {
            await Clients.All.SendAsync("UserOffline", new { userId });
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Join a chat room
    /// </summary>
    public async Task JoinRoom(string roomId)
    {
        var userId = GetUserId();
        var username = GetUsername();

        await Groups.AddToGroupAsync(Context.ConnectionId, $"room:{roomId}");

        _logger.LogInformation("👥 User {Username} joined room {RoomId}", username, roomId);

        // Get existing members before adding the new one
        List<object> existingMembers;
        lock (_lock)
        {
            if (!_roomMembers.ContainsKey(roomId))
            {
                _roomMembers[roomId] = new HashSet<(string, string, string)>();
            }

            existingMembers = _roomMembers[roomId]
                .Select(m => new { userId = m.UserId, username = m.Username })
                .Cast<object>()
                .ToList();

            // Add the new member
            _roomMembers[roomId].Add((userId, username, Context.ConnectionId));
        }

        // Send existing members to the new joiner
        await Clients.Caller.SendAsync("RoomMembers", new
        {
            roomId,
            members = existingMembers
        });

        // Notify other room members about the new joiner
        await Clients.OthersInGroup($"room:{roomId}").SendAsync("UserJoinedRoom", new
        {
            roomId,
            userId,
            username
        });
    }

    /// <summary>
    /// Leave a chat room
    /// </summary>
    public async Task LeaveRoom(string roomId)
    {
        var userId = GetUserId();
        var username = GetUsername();

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"room:{roomId}");

        _logger.LogInformation("👋 User {Username} left room {RoomId}", username, roomId);

        // Remove from tracking
        lock (_lock)
        {
            if (_roomMembers.ContainsKey(roomId))
            {
                _roomMembers[roomId].RemoveWhere(m => m.ConnectionId == Context.ConnectionId);
                if (_roomMembers[roomId].Count == 0)
                {
                    _roomMembers.Remove(roomId);
                }
            }
        }

        // Notify other room members
        await Clients.Group($"room:{roomId}").SendAsync("UserLeftRoom", new
        {
            roomId,
            userId,
            username
        });
    }

    /// <summary>
    /// Send message to a room
    /// </summary>
    public async Task SendToRoom(string roomId, string message)
    {
        var userId = GetUserId();
        var username = GetUsername();

        _logger.LogInformation("💬 Message sent to room {RoomId} by {Username}", roomId, username);

        // Broadcast to all users in the room (including sender)
        await Clients.Group($"room:{roomId}").SendAsync("RoomMessage", new
        {
            roomId,
            messageId = Guid.NewGuid().ToString(),
            senderId = userId,
            senderUsername = username,
            message,
            timestamp = DateTime.UtcNow.ToString("o")
        });
    }

    /// <summary>
    /// Get current user ID from claims
    /// </summary>
    private string GetUserId()
    {
        return Context.User?.FindFirst("userId")?.Value
            ?? throw new HubException("User ID not found in claims");
    }

    /// <summary>
    /// Get current user email from claims
    /// </summary>
    private string GetUserEmail()
    {
        return Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
            ?? "Unknown";
    }

    /// <summary>
    /// Get current user role from claims
    /// </summary>
    private string GetUserRole()
    {
        return Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
            ?? "User";
    }

    /// <summary>
    /// Get current username from claims
    /// </summary>
    private string GetUsername()
    {
        return Context.User?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value
            ?? "Unknown";
    }
}
