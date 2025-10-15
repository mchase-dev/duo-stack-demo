using Mapster;
using DuoStackDemo.Data.Entities;
using DuoStackDemo.DTOs.Responses;
using System.Text.Json;

namespace DuoStackDemo.Domain.Mappings;

/// <summary>
/// Configures Mapster mappings between entities and DTOs
/// </summary>
public static class MappingConfig
{
    /// <summary>
    /// Register all mapping configurations
    /// </summary>
    public static void RegisterMappings()
    {
        // User to UserDto mapping
        TypeAdapterConfig<User, UserDto>
            .NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Email, src => src.Email)
            .Map(dest => dest.EmailConfirmed, src => src.EmailConfirmed)
            .Map(dest => dest.Username, src => src.Username)
            .Map(dest => dest.FirstName, src => src.FirstName)
            .Map(dest => dest.LastName, src => src.LastName)
            .Map(dest => dest.PhoneNumber, src => src.PhoneNumber)
            .Map(dest => dest.AvatarUrl, src => src.AvatarUrl)
            .Map(dest => dest.Bio, src => src.Bio)
            .Map(dest => dest.Role, src => src.Role)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.UpdatedAt, src => src.UpdatedAt);

        // Event to EventDto mapping
        TypeAdapterConfig<Event, EventDto>
            .NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Title, src => src.Title)
            .Map(dest => dest.Description, src => src.Description)
            .Map(dest => dest.StartTime, src => src.StartTime)
            .Map(dest => dest.EndTime, src => src.EndTime)
            .Map(dest => dest.Visibility, src => src.Visibility)
            .Map(dest => dest.AllowedUserIds, src => ParseAllowedUserIds(src.AllowedUserIds))
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.CreatorUsername, src => src.Creator != null ? src.Creator.Username : string.Empty)
            .Map(dest => dest.Color, src => src.Color)
            .Map(dest => dest.Location, src => src.Location)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.UpdatedAt, src => src.UpdatedAt);

        // Message to MessageDto mapping
        TypeAdapterConfig<Message, MessageDto>
            .NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.FromUserId, src => src.FromUserId)
            .Map(dest => dest.ToUserId, src => src.ToUserId)
            .Map(dest => dest.Content, src => src.Content)
            .Map(dest => dest.IsRead, src => src.IsRead)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt);

        // Room to RoomDto mapping
        TypeAdapterConfig<Room, RoomDto>
            .NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Name, src => src.Name)
            .Map(dest => dest.Slug, src => src.Slug)
            .Map(dest => dest.IsPublic, src => src.IsPublic)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.Creator, src => src.Creator)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt);

        // Page to PageDto mapping
        TypeAdapterConfig<Page, PageDto>
            .NewConfig()
            .Map(dest => dest.Id, src => src.Id)
            .Map(dest => dest.Title, src => src.Title)
            .Map(dest => dest.Slug, src => src.Slug)
            .Map(dest => dest.Content, src => src.Content)
            .Map(dest => dest.IsPublished, src => src.IsPublished)
            .Map(dest => dest.CreatedBy, src => src.CreatedBy)
            .Map(dest => dest.Creator, src => src.Creator)
            .Map(dest => dest.CreatedAt, src => src.CreatedAt)
            .Map(dest => dest.UpdatedAt, src => src.UpdatedAt);
    }

    /// <summary>
    /// Parse JSON string of allowed user IDs to List of Guids
    /// </summary>
    private static List<Guid>? ParseAllowedUserIds(string? allowedUserIdsJson)
    {
        if (string.IsNullOrEmpty(allowedUserIdsJson))
            return null;

        try
        {
            return JsonSerializer.Deserialize<List<Guid>>(allowedUserIdsJson);
        }
        catch
        {
            return null;
        }
    }
}
