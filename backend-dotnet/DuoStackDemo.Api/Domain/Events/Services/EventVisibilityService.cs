using System.Text.Json;
using DuoStackDemo.Data.Entities;

namespace DuoStackDemo.Domain.Events.Services;

/// <summary>
/// Service for handling event visibility and authorization rules
/// </summary>
public class EventVisibilityService
{
    /// <summary>
    /// Check if user can view an event based on visibility rules
    /// </summary>
    public bool CanViewEvent(Event eventEntity, Guid userId, UserRole userRole)
    {
        // Private: owner only
        if (eventEntity.Visibility == EventVisibility.Private)
        {
            return eventEntity.CreatedBy == userId;
        }

        // Public: all authenticated users
        if (eventEntity.Visibility == EventVisibility.Public)
        {
            return true;
        }

        // Restricted: owner + allowedUserIds + Admin/Superuser
        if (eventEntity.Visibility == EventVisibility.Restricted)
        {
            if (eventEntity.CreatedBy == userId) return true;
            if (userRole == UserRole.Admin || userRole == UserRole.Superuser) return true;

            if (!string.IsNullOrEmpty(eventEntity.AllowedUserIds))
            {
                try
                {
                    var allowedUserIds = JsonSerializer.Deserialize<List<Guid>>(eventEntity.AllowedUserIds);
                    if (allowedUserIds != null && allowedUserIds.Contains(userId))
                    {
                        return true;
                    }
                }
                catch
                {
                    // Ignore JSON parsing errors
                }
            }

            return false;
        }

        return false;
    }

    /// <summary>
    /// Check if user can modify an event
    /// </summary>
    public bool CanModifyEvent(Event eventEntity, Guid userId, UserRole userRole)
    {
        // Owner can always modify
        if (eventEntity.CreatedBy == userId) return true;

        // Admin and Superuser can modify any event
        if (userRole == UserRole.Admin || userRole == UserRole.Superuser) return true;

        return false;
    }
}
